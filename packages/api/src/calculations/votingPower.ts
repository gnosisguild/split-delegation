import { DelegationGraph, Scores } from '../types'

export default function calculateVotingPower({
  delegations,
  scores,
  addresses,
}: {
  delegations: DelegationGraph
  scores: Scores
  addresses: string[]
}) {
  return Object.fromEntries(
    addresses.map((address) => [
      address,
      calculateForAddress({ delegations, scores, address }),
    ])
  )
}

export function calculateForAddress({
  delegations,
  scores,
  address,
}: {
  delegations: DelegationGraph
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
