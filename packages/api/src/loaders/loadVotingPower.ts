import { Chain } from 'viem'

import { timerEnd, timerStart } from '../fns/timer'
import calculateVotingPower from '../calculations/votingPower'
import createDelegationGraph from '../fns/delegations/createDelegationGraph'
import filterVertices from '../fns/graph/filterVertices'
import kahn from '../fns/graph/sort'
import loadScores from './loadScores'
import loadWeights from './loadWeights'

export default async function loadVotingPower({
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
  const delegations = createDelegationGraph({ weights, order })
  const result = Object.fromEntries(
    addresses.map((address) => [
      address,
      calculateVotingPower({ delegations, scores, address }),
    ])
  )

  console.log(`[VotingPower] ${space}, done in ${timerEnd(start)}ms`)

  return { weights, scores, votingPower: result }
}
