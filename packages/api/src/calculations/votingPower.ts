import delegateTree from './delegateTree'
import incomingPower from './incomingPower'

import { Graph, Scores } from '../types'

export default function calculateVotingPower({
  weights,
  rweights,
  scores,
  address,
}: {
  weights: Graph
  rweights: Graph
  scores: Scores
  address: string
}) {
  const incoming = incomingPower({ weights, rweights, scores, address })
  const own = scores[address]
  const outgoing = delegateTree({
    weights,
    rweights,
    scores,
    address,
  }).reduce((result, { delegatedPower }) => result + delegatedPower, 0)

  return {
    incomingPower: incoming,
    outgoingPower: outgoing,
    votingPower: incoming + own - outgoing,
  }
}
