import calculateDelegatorTree from './delegatorTree'
import calculateDelegateTree from './delegateTree'

import { DelegationDAGs, Scores } from '../types'

export default function calculateVotingPower({
  dags,
  scores,
  address,
}: {
  dags: DelegationDAGs
  scores: Scores
  address: string
}) {
  const delegatorTree = calculateDelegatorTree({
    dags,
    scores,
    address,
  })

  const incomingPower = delegatorTree.reduce(
    (power, { delegatedPower }) => power + delegatedPower,
    0
  )

  const delegateTree = calculateDelegateTree({
    dags,
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
