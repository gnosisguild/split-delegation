import calculateDelegatorTree from './delegatorTree'
import calculateDelegateTree from './delegateTree'

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
  const delegatorTree = calculateDelegatorTree({
    weights,
    rweights,
    scores,
    address,
  })

  const incomingPower = delegatorTree.reduce(
    (power, { delegatedPower }) => power + delegatedPower,
    0
  )

  const delegateTree = calculateDelegateTree({
    weights,
    rweights,
    scores,
    address,
  })

  const outgoingPower = delegateTree.reduce(
    (power, { delegatedPower }) => power + delegatedPower,
    0
  )

  return {
    votingPower: incomingPower + scores[address] - outgoingPower,
    incomingPower,
    outgoingPower,
  }
}
