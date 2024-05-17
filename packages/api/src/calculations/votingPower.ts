import { DelegationDAG, Scores } from '../types'

export default function calculateVotingPower({
  delegations,
  scores,
  address,
}: {
  delegations: DelegationDAG
  scores: Scores
  address: string
}) {
  const { incoming, outgoing } = delegations[address] || {
    incoming: [],
    outgoing: [],
  }
  const inPower = incoming
    .map(({ address: delegate, ratio }) => scores[delegate]! * ratio)
    .reduce((p, n) => p + n, 0)
  const ownPower = scores[address]!
  const outPower = outgoing
    .filter(({ direct }) => direct)
    .map(({ ratio }) => (inPower + ownPower) * ratio)
    .reduce((p, n) => p + n, 0)

  return inPower + ownPower - outPower
}
