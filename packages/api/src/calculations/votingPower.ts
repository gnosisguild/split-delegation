import { formatUnits, parseUnits } from 'viem'

import basisPoints from '../fns/basisPoints'
import distribute from '../fns/distribute'
import formatDecimal from '../fns/formatDecimal'

import { Delegations, Scores, Weights } from '../types'

export default function calculateVotingPower({
  weights,
  scores,
  delegations,
  totalSupply,
  address,
}: {
  weights: Weights<bigint>
  scores: Scores
  delegations: Delegations
  totalSupply: number
  address: string
}) {
  const total = (address: string) =>
    Object.values(weights[address]).reduce((p, v) => p + v, 0n) as bigint

  const powerIn = delegations[address].delegators.map(
    ({ address: delegator, weight }) => ({
      address: delegator,
      value: weightedScore(scores[delegator], weight, total(delegator)),
    })
  )

  const delegatedPower = powerIn.reduce((p, { value }) => p + value, 0)
  const votingPower = delegatedPower + scores[address]

  const delegators = powerIn.map(({ address: delegator, value }) => ({
    address: delegator,
    direct: !!weights[delegator][address],
    votingPower: value,
    percentPowerIn: basisPoints(value, votingPower),
  }))

  const delegates = distribute(delegations[address].delegates, votingPower).map(
    ({ address: delegate, value }) => ({
      address: delegate,
      direct: !!weights[address][delegate],
      votingPower: value,
      percentPowerOut: basisPoints(value, votingPower),
    })
  )

  return {
    votingPower,
    percentOfVotingPower: basisPoints(votingPower, totalSupply),
    percentOfDelegators: basisPoints(
      delegators.length,
      Object.keys(weights).length
    ),
    delegators,
    delegates,
  }
}

function weightedScore(score: number, weight: bigint, total: bigint) {
  return Number(
    formatUnits((weight * parseUnits(formatDecimal(score), 18)) / total, 18)
  )
}
