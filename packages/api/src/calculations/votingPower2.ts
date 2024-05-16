import { DelegationGraph, Scores } from '../types'

export default function calculateVotingPower2({
  delegations,
  scores,
  addresses,
}: {
  delegations: DelegationGraph
  scores: Scores
  addresses: string[]
}) {
  const result: Scores = {}
  for (const address of addresses) {
    const { incoming, outgoing } = delegations[address] || {
      incoming: [],
      outgoing: [],
    }
    const inPower = incoming
      .map(({ address, ratio }) => scores[address]! * ratio)
      .reduce((p, n) => p + n, 0)
    const ownPower = scores[address]!
    const outPower = outgoing
      .filter(({ direct }) => direct)
      .map(({ address, ratio }) => scores[address]! * ratio)
      .reduce((p, n) => p + n, 0)
    result[address] = inPower + ownPower - outPower
  }
  return result
}
