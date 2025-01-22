import assert from 'assert'
import { Chain } from 'viem'
import snapshot from '@snapshot-labs/snapshot.js'

import merge from '../fns/merge'
import { Scores } from '../types'

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
  addresses: string[]
}): Promise<Scores> {
  const rawScores = await _load({
    chain,
    blockNumber,
    space,
    strategies,
    addresses,
  })

  // ensure that all address gets at least a 0
  // Snapshot omits zero balances from the result
  const result = merge(
    Object.fromEntries(addresses.map((address) => [address.toLowerCase(), 0])),
    rawScores
  )

  assert(addresses.length == Object.keys(result).length)

  return result
}

async function _load({
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
  addresses: string[]
}): Promise<Scores> {
  const CHUNK = 3000
  let result = {}
  while (addresses.length) {
    const curr = addresses.slice(0, CHUNK)
    result = {
      ...result,
      ...(await loadWithRetry({
        chain,
        blockNumber,
        space,
        strategies,
        addresses: curr,
      })),
    }
    addresses = addresses.slice(CHUNK)
  }

  return result
}

async function loadWithRetry({
  chain,
  blockNumber,
  space,
  strategies,
  addresses,
}: {
  chain: Chain
  blockNumber: number
  space: string
  strategies: any
  addresses: string[]
}): Promise<Scores> {
  try {
    const results = await snapshot.utils.getScores(
      space,
      strategies,
      String(chain.id),
      addresses,
      blockNumber
    )

    return ensureLowerCaseAddresses(merge(...results))
  } catch (e) {
    if (addresses.length < 100) {
      throw e
    }

    console.warn(`[Scores] ${space} ${addresses.length}, retry`)

    const args = {
      chain,
      blockNumber,
      space,
      strategies,
    }

    const middle = addresses.length / 2
    const [a, b] = await Promise.all([
      loadWithRetry({
        ...args,
        addresses: addresses.slice(0, middle),
      }),
      loadWithRetry({
        ...args,
        addresses: addresses.slice(middle),
      }),
    ])

    return merge(a, b)
  }
}

function ensureLowerCaseAddresses(scores: Scores) {
  return Object.fromEntries(
    Object.entries(scores).map(([address, score]) => [
      address.toLowerCase(),
      score,
    ])
  )
}
