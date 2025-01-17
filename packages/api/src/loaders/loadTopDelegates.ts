import { Chain, keccak256, toBytes } from 'viem'

import { timerEnd, timerStart } from '../fns/timer'
import allNodes from '../fns/graph/allNodes'
import delegateStats, {
  DelegateStats,
  top,
} from '../calculations/delegateStats'

import { cacheGet, cachePut } from './cache'
import loadScores from './loadScores'
import loadDelegationDAGs from './loadDelegationDAGs'

const LOG_PREFIX = 'TopDelegates'

export default async function loadTopDelegates({
  chain,
  blockNumber,
  space,
  strategies,
  totalSupply,
}: {
  chain: Chain
  blockNumber: number
  space: string
  strategies: any[]
  totalSupply: number
}): Promise<{ topDelegates: DelegateStats[] }> {
  const start = timerStart()
  const key = cacheKey({ chain, blockNumber, space, strategies, totalSupply })

  let entry: { topDelegates: DelegateStats[] } | null = await cacheGet(
    key,
    LOG_PREFIX
  )
  if (!entry) {
    entry = await _load({
      chain,
      blockNumber,
      space,
      strategies,
      totalSupply,
    })
    await cachePut(
      key,
      { chain: chain.id, blockNumber, space, entry },
      LOG_PREFIX
    )
  }

  console.log(`[${LOG_PREFIX}] ${space}, done in ${timerEnd(start)}ms`)

  return entry
}

async function _load({
  chain,
  blockNumber,
  space,
  strategies,
  totalSupply,
}: {
  chain: Chain
  blockNumber: number
  space: string
  strategies: any[]
  totalSupply: number
}) {
  const dags = await loadDelegationDAGs({
    chain,
    blockNumber,
    space,
  })

  const scores = await loadScores({
    chain,
    blockNumber,
    space,
    strategies,
    addresses: allNodes(dags.forward),
  })

  return {
    topDelegates: top(
      delegateStats({
        dags,
        scores,
        totalSupply,
      })
    ),
  }
}

function cacheKey({
  chain,
  blockNumber,
  space,
  strategies,
  totalSupply,
}: {
  chain: Chain
  blockNumber: number
  space: string
  strategies: any[]
  totalSupply: number
}) {
  return keccak256(
    toBytes(
      JSON.stringify({
        name: 'loadTopDelegates',
        chainId: chain.id,
        blockNumber,
        space,
        strategies,
        totalSupply,
      })
    )
  )
}
