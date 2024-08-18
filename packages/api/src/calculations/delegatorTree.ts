import distribution from './distribution'

import { DelegationDAGs, Scores } from '../types'

export type DelegatorTreeNode = {
  delegator: string
  expiration: number
  weight: number
  delegatedPower: number
  parents: DelegatorTreeNode[]
}

export default function delegatorTree({
  delegations,
  scores,
  address,
}: {
  delegations: DelegationDAGs
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

    const { expiration, weightInBasisPoints, distributedPower } = distribution({
      delegation: delegations.forward,
      delegator,
      delegate: address,
      availablePower,
    })

    return {
      delegator,
      expiration,
      weight: weightInBasisPoints,
      delegatedPower: distributedPower,
      parents,
    }
  })
}
