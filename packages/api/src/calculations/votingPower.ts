import delegateTree from './delegateTree'
import delegatorTree from './delegatorTree'

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
  const incoming = delegatorTree({
    weights,
    rweights,
    scores,
    address,
  }).reduce((power, { delegatedPower }) => power + delegatedPower, 0)

  const outgoing = delegateTree({ weights, rweights, scores, address }).reduce(
    (power, { delegatedPower }) => power + delegatedPower,
    0
  )
  const direct = scores[address]

  return {
    votingPower: incoming + direct - outgoing,
    incomingPower: incoming,
    outgoingPower: outgoing,
  }
}
