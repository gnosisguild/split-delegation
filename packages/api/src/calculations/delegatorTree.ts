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
  return Object.keys(delegations.reverse[address] || {})
    .filter((delegator) => delegator != address) // exclude self referencing edges, these are not delegators
    .map((delegator) => {
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
