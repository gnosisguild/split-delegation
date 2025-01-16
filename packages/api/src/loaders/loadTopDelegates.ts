import { Chain } from 'viem'

import { timerEnd, timerStart } from '../fns/timer'
import allNodes from '../fns/graph/allNodes'
import delegateStats, {
  DelegateStats,
  top,
} from '../calculations/delegateStats'

import loadScores from './loadScores'
import loadDelegationDAGs from './loadDelegationDAGs'

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
}): Promise<DelegateStats[]> {
  const start = timerStart()
  const { topDelegates } = await _load({
    chain,
    blockNumber,
    space,
    strategies,
    totalSupply,
  })
  console.log(`[TopDelegates] ${space}, done in ${timerEnd(start)}ms`)

  return topDelegates
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

  const result = {
    topDelegates: top(
      delegateStats({
        dags,
        scores,
        totalSupply,
      })
    ),
  }

  return result
}
