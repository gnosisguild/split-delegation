import distribution from './distribution'

import { Delegations, Scores } from '../types'

export type DelegatorTreeNode = {
  delegator: string
  weight: number
  delegatedPower: number
  parents: DelegatorTreeNode[]
}

export default function delegatorTree({
  delegations,
  scores,
  address,
}: {
  delegations: Delegations
  scores: Scores
  address: string
}): DelegatorTreeNode[] {
  const delegators = Object.keys(delegations.reverse[address] || {})
    // a self referencing edge is not a delegator
    .filter((delegator) => address != delegator)

  return delegators.map((delegator) => {
    const parents = delegatorTree({
      delegations,
      scores,
      address: delegator,
    })

    const availablePower: number =
      scores[delegator]! +
      parents.reduce((r, { delegatedPower }) => r + delegatedPower, 0)

    const { weightInBasisPoints, distributedPower } = distribution({
      weights: delegations.forward,
      delegator,
      delegate: address,
      availablePower,
    })

    return {
      delegator,
      weight: weightInBasisPoints,
      delegatedPower: distributedPower,
      parents,
    }
  })
}
