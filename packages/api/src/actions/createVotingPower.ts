import { Chain } from 'viem'

import { timerEnd, timerStart } from '../fns/timer'
import calculateVotingPower from '../calculations/votingPower'
import filterVertices from '../fns/graph/filterVertices'
import kahn from '../fns/graph/sort'
import loadScores from '../loaders/loadScores'
import loadWeights from '../loaders/loadWeights'

export default async function createVotingPower({
  chain,
  blockNumber,
  space,
  strategies,
  addresses: { voters = [], include = [] } = {},
}: {
  chain: Chain
  blockNumber: number
  space: string
  strategies: any[]
  addresses?: {
    voters?: string[]
    include?: string[]
  }
}) {
  let { weights } = await loadWeights({
    chain,
    blockNumber,
    space,
  })

  if (voters && voters.length > 0) {
    // Filter out the addresses exercising voting right, from delegator weights
    weights = filterVertices(weights, voters)
  }

  const order = kahn(weights)

  const addresses =
    voters.length > 0 || include.length > 0
      ? Array.from(new Set([...order, ...voters, ...include]))
      : order

  const { scores } = await loadScores({
    chain,
    blockNumber,
    space,
    strategies,
    addresses,
  })

  const start = timerStart()
  const votingPower = await calculateVotingPower({
    weights,
    scores,
    order,
  })
  console.log(`[VotingPower] ${space}, done in ${timerEnd(start)}ms`)

  return { weights, votingPower }
}
