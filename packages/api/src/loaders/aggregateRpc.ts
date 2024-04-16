import assert from 'assert'
import rangeToChunks from 'src/fns/rangeToChunks'

import { RpcFetch } from './types'

type Stint<T> = {
  from: number
  to: number
  promise: Promise<T[]> | null
  result: T[] | null
  done: boolean
}

enum StintStatus {
  New,
  Loading,
  Uncollected,
  Done,
}

const PARALLELISM = 10
const MAX_RPC_BLOCK_RANGE = 3000

export default async function aggregateRpc<T>(
  { fromBlock, toBlock }: { fromBlock: number; toBlock: number },
  fetch: RpcFetch<T>
): Promise<T[]> {
  assert(fromBlock <= toBlock)
  if (toBlock - fromBlock < MAX_RPC_BLOCK_RANGE) {
    return fetch(fromBlock, toBlock)
  }

  let stints = init<T>(fromBlock, toBlock)
  while (!isDone(stints)) {
    stints = dispatch(stints, fetch)
    stints = await collect(stints)
    await pause(10)
  }

  return stints.reduce((result, stint) => {
    assert(status(stint) == StintStatus.Done)
    assert(stint.result !== null)
    return [...result, ...stint.result]
  }, [] as T[])
}

function isDone<T>(stints: Stint<T>[]) {
  return stints.every((stint) => status(stint) == StintStatus.Done)
}

function init<T>(fromBlock: number, toBlock: number): Stint<T>[] {
  return rangeToChunks(fromBlock, toBlock, MAX_RPC_BLOCK_RANGE).map(
    ({ from, to }) => ({
      from,
      to,
      promise: null,
      result: null,
      done: false,
    })
  )
}

function dispatch<T>(stints: Stint<T>[], fetch: RpcFetch<T>): Stint<T>[] {
  let result: Stint<T>[] = []
  let active = 0

  for (const stint of stints) {
    const isDispatch = active < PARALLELISM && status(stint) == StintStatus.New
    const isLoading = status(stint) == StintStatus.Loading

    result = [
      ...result,
      isDispatch ? { ...stint, promise: fetch(stint.from, stint.to) } : stint,
    ]

    if (isDispatch || isLoading) {
      active++
    }
  }

  return result
}

async function collect<T>(stints: Stint<T>[]): Promise<Stint<T>[]> {
  let result: Stint<T>[] = []

  for (let stint of stints) {
    if (status(stint) == StintStatus.Loading) {
      assert(stint.promise != null)
      stint = { ...stint, result: await tryToCollect(stint.promise) }
    }
    if (status(stint) == StintStatus.Uncollected) {
      assert(stint.result != null)
      stint = { ...stint, done: true }
    }

    result = [...result, stint]
  }

  return result
}

function tryToCollect<T>(promise: Promise<T>): Promise<T | null> {
  const pending = Symbol('Pending')

  return Promise.race([promise, pending]).then((value) =>
    value === pending ? null : (value as Awaited<T>)
  )
}

function status<T>(stint: Stint<T>): StintStatus {
  if (!stint.promise) {
    return StintStatus.New
  }

  if (!stint.result) {
    return StintStatus.Loading
  }

  return stint.done ? StintStatus.Done : StintStatus.Uncollected
}

async function pause(duration: number) {
  await new Promise((resolve) => setTimeout(resolve, duration))
}
