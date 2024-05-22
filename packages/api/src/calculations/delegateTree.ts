import delegatorTree from './delegatorTree'
import distribution from './distribution'

import { Delegations, Scores } from '../types'

export type DelegateTreeNode = {
  delegate: string
  weight: number
  delegatedPower: number
  children: DelegateTreeNode[]
}
export default function delegateTree({
  delegations,
  scores,
  address,
}: {
  delegations: Delegations
  scores: Scores
  address: string
}): DelegateTreeNode[] {
  if (!delegations.forward[address]) {
    // Not a delegator?
    return []
  }

  const parents = delegatorTree({
    delegations,
    scores,
    address,
  })
  const availablePower =
    scores[address]! +
    parents.reduce((r, { delegatedPower }) => r + delegatedPower, 0)

  return Object.keys(delegations.forward[address])
    .filter((delegate) => address != delegate) // exclude self referencing edges, these are not delegates
    .map((delegate) => {
      const { weightInBasisPoints, distributedPower } = distribution({
        weights: delegations.forward,
        delegator: address,
        delegate,
        availablePower,
      })
      return {
        delegate,
        weight: weightInBasisPoints,
        delegatedPower: distributedPower,
        children: delegateTree({
          delegations,
          scores,
          address: delegate,
        }),
      }
    })
}
