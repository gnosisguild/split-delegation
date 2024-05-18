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
  const _incomingPower = incomingPower({ weights, rweights, scores, address })
  const ownPower = scores[address]
  const outgoingPower = delegateTree({
    weights,
    rweights,
    scores,
    address,
  }).reduce((result, { delegatedPower }) => result + delegatedPower, 0)

  return {
    incomingPower: _incomingPower,
    outgoingPower,
    votingPower: _incomingPower + ownPower - outgoingPower,
  }
}
