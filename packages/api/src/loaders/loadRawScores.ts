import assert from 'assert'
import { Address, Chain, getAddress } from 'viem'
import snapshot from '@snapshot-labs/snapshot.js'

import { merge } from '../fns/bag'
import { Scores } from '../../src/types'
import { timerEnd, timerStart } from '../../src/fns/timer'

export default async function loadRawScores({
  chain,
  blockNumber,
  space,
  strategies,
  addresses,
}: {
  chain: Chain
  blockNumber: number
  space: string
  strategies: any[]
  addresses: Address[]
}) {
  const results = await Promise.all(
    strategies.map((strategy) =>
      loadStrategy({
        chain,
        blockNumber,
        space,
        strategy: maybePatchStrategy(strategy),
        addresses,
      })
    )
  )

  return merge(...results)
}

async function loadStrategy({
  chain,
  blockNumber,
  space,
  strategy,
  addresses,
}: {
  chain: Chain
  blockNumber: number
  space: string
  strategy: any
  addresses: Address[]
}): Promise<Scores> {
  const CHUNK = chunkForStrategy(strategy)

  let result = {}
  while (addresses.length) {
    const start = timerStart()
    const curr = addresses.slice(0, CHUNK)
    console.log(`[Load Scores] ${space} ${strategy.name} ${curr.length}, start`)
    result = {
      ...result,
      ...(await loadStrategyWithRetry({
        chain,
        blockNumber,
        space,
        strategy,
        addresses: curr,
      })),
    }
    console.log(
      `[Load Scores] ${space} ${strategy.name} ${curr.length}, done in ${timerEnd(start)}ms`
    )
    addresses = addresses.slice(CHUNK)
  }

  return result
}

async function loadStrategyWithRetry({
  chain,
  blockNumber,
  space,
  strategy,
  addresses,
}: {
  chain: Chain
  blockNumber: number
  space: string
  strategy: any
  addresses: Address[]
}): Promise<Scores> {
  try {
    const [result] = await snapshot.utils.getScores(
      space,
      [strategy],
      String(chain.id),
      addresses,
      blockNumber
    )

    assert(
      Object.keys(result)
        .slice(0, 50) // just a sample
        .every((address) => address == getAddress(address)),
      'snapshot.getScores Non Check-summed Address'
    )
    return result
  } catch (e) {
    if (addresses.length < 100) {
      throw e
    }

    console.log(
      `[Load Scores] ${space} ${strategy.name} ${addresses.length}, retry`
    )

    const args = {
      chain,
      blockNumber,
      space,
      strategy,
    }

    const middle = addresses.length / 2
    const [a, b] = await Promise.all([
      loadStrategyWithRetry({
        ...args,
        addresses: addresses.slice(0, middle),
      }),
      loadStrategyWithRetry({
        ...args,
        addresses: addresses.slice(middle),
      }),
    ])

    return merge(a, b)
  }
}

function chunkForStrategy(strategy: any): number {
  if (strategy.name == 'safe-vested') {
    return 5000
  } else {
    return 10000
  }
}

function maybePatchStrategy(strategy: any) {
  // {
  //   name: 'safe-vested',
  //   network: '1',
  //   params: {
  //     symbol: 'SAFE (vested)',
  //     claimDateLimit: '2022-12-27T10:00:00+00:00',
  //     allocationsSource:
  //       'https://safe-claiming-app-data.safe.global/allocations/1/snapshot-allocations-data.json',
  //   },
  // }

  const shouldPatch =
    strategy?.name == 'safe-vested' &&
    strategy?.params?.allocationsSource ==
      'https://safe-claiming-app-data.safe.global/allocations/1/snapshot-allocations-data.json'

  if (!shouldPatch) {
    return strategy
  }

  return {
    ...strategy,
    params: {
      ...strategy.params,
      allocationsSource:
        'https://raw.githubusercontent.com/gnosisguild/split-delegation/main/packages/api/api/v1/safe.eth/snapshot-allocations-trimmed.json',
    },
  }
}
