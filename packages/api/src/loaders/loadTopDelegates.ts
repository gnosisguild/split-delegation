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

  const result = await _load({
    chain,
    blockNumber,
    space,
    strategies,
    totalSupply,
  })
  console.log(`[${LOG_PREFIX}] ${space}, done in ${timerEnd(start)}ms`)

  return result
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
}): Promise<{ topDelegates: DelegateStats[] }> {
  const key = cacheKey({ chain, blockNumber, space, strategies, totalSupply })

  const entry: { topDelegates: DelegateStats[] } | null = await cacheGet(
    key,
    LOG_PREFIX
  )
  if (entry) {
    return { topDelegates: entry.topDelegates }
  }

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

  const topDelegates: DelegateStats[] = top(
    delegateStats({
      dags,
      scores,
      totalSupply,
    })
  )

  await cachePut(
    key,
    { chain: chain.id, blockNumber, space, topDelegates },
    LOG_PREFIX
  )

  return { topDelegates }
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
