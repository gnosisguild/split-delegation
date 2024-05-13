import { formatUnits, parseUnits } from 'viem'

import basisPoints from '../fns/basisPoints'
import cascade from './cascade'
import formatDecimal from '../fns/formatDecimal'
import kahn from '../fns/graph/sort'

import { Weights } from '../types'

export default function calculateDelegations({
  weights,
  votingPower,
  totalSupply,
  address,
}: {
  weights: Weights<bigint>
  votingPower: Record<string, number>
  totalSupply: number
  address: string
}) {
  const cascades = cascade({ weights, order: kahn(weights) })
  const total = (address: string) =>
    Object.values(weights[address]).reduce((p, v) => p + v, 0n)

  const delegators = cascades[address].delegators
    .map(({ address: delegator, weight }) => ({
      address: delegator,
      direct: !!weights[delegator][address],
      delegatedPower: weightedScore(
        votingPower[delegator],
        weight,
        total(delegator)
      ),
    }))
    .map(({ delegatedPower, ...rest }) => ({
      ...rest,
      delegatedPower,
      percentPowerIn: basisPoints(delegatedPower, votingPower[address]),
    }))

  const delegates = cascades[address].delegates
    .map(({ address: delegate, weight }) => ({
      address: delegate,
      direct: !!weights[address][delegate],
      delegatedPower: weightedScore(
        votingPower[address],
        weight,
        total(address)
      ),
    }))
    .map(({ delegatedPower, ...rest }) => ({
      ...rest,
      delegatedPower,
      percentPowerOut: basisPoints(delegatedPower, votingPower[address]),
    }))

  return {
    votingPower,
    percentOfVotingPower: basisPoints(votingPower[address], totalSupply),
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
