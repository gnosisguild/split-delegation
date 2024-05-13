import { formatUnits, parseUnits } from 'viem'

import formatDecimal from '../fns/formatDecimal'

import { Delegations, Scores, Weights } from '../types'

export default function ({
  weights,
  scores,
  delegations,
  address,
}: {
  weights: Weights<bigint>
  scores: Scores
  delegations: Delegations
  address: string
}) {
  const total = (address: string) =>
    Object.values(weights[address]).reduce((p, v) => p + v, 0n) as bigint

  const delegatedPower = delegations[address].delegates
    .map(({ address: delegator, weight }) => {
      const score = scores[delegator]
      return Number(
        formatUnits(
          (weight * parseUnits(formatDecimal(score), 18)) / total(delegator),
          18
        )
      )
    })
    .reduce((p, v) => p + v, 0)

  return delegatedPower + scores[address]
}
