import distribution from './distribution'

import { Graph, Scores } from '../types'

export type DelegatorTreeNode = {
  delegator: string
  weight: number
  delegatedPower: number
  parents: DelegatorTreeNode[]
}

export default function delegatorTree({
  weights,
  rweights,
  scores,
  address,
}: {
  weights: Graph
  rweights: Graph
  scores: Scores
  address: string
}): DelegatorTreeNode[] {
  return Object.keys(rweights[address] || {})
    .filter((delegator) => delegator != address) // exclude self referencing edges, these are not delegators
    .map((delegator) => {
      const parents = delegatorTree({
        weights,
        rweights,
        scores,
        address: delegator,
      })

      const availablePower: number =
        scores[delegator]! +
        parents.reduce((r, { delegatedPower }) => r + delegatedPower, 0)

      const { weightInBasisPoints, distributedPower } = distribution({
        weights,
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
