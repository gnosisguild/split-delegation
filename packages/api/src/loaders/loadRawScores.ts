import assert from 'assert'
import { Chain, getAddress } from 'viem'
import snapshot from '@snapshot-labs/snapshot.js'

import { merge } from '../fns/bag'
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
}) {
  const result = await _load({
    chain,
    blockNumber,
    space,
    strategies: strategies.map(maybePatchStrategy),
    addresses,
  })

  // ensure that all address gets at least a 0
  // Snapshot omits zero balances from the result
  return merge(
    Object.fromEntries(addresses.map((address) => [address, 0])),
    result
  )
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

    const result = merge(...results)

    assert(
      Object.keys(result)
        .slice(0, 50) // just a sample
        .every((address) => address == getAddress(address)),
      'snapshot.getScores not checksummed'
    )
    return result
  } catch (e) {
    if (addresses.length < 100) {
      throw e
    }

    console.log(`[Load Scores] ${space} ${addresses.length}, retry`)

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
