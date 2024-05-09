import { Address, Chain } from 'viem'

import { timerEnd, timerStart } from '../fns/timer'
import allNodes from '../fns/graph/allNodes'
import compute from '../compute'
import loadScores from './loadScores'
import loadWeights from './loadWeights'

export default async function loadPower({
  chain,
  blockNumber,
  space,
  strategies,
  addresses: { voters = [], more = [] } = {},
}: {
  chain: Chain
  blockNumber: number
  space: string
  strategies: any[]
  addresses?: {
    voters?: Address[]
    more?: Address[]
  }
}) {
  const { weights } = await loadWeights({
    chain,
    blockNumber,
    space,
  })

  const addresses =
    voters.length > 0 || more.length > 0
      ? Array.from(new Set([...allNodes(weights), ...voters, ...more]))
      : allNodes(weights)

  const { scores } = await loadScores({
    chain,
    blockNumber,
    space,
    strategies,
    addresses,
  })

  const start = timerStart()
  const { votingPower, delegatorCount } = await compute({
    weights,
    scores,
    voters,
  })
  console.log(`[Compute] ${space}, done in ${timerEnd(start)}ms`)

  return {
    weights,
    scores,
    votingPower,
    delegatorCount,
  }
}
