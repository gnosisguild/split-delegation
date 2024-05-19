import basisPoints from '../fns/basisPoints'
import distribute from '../fns/distribute'

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
  return (
    Object.keys(rweights[address] || {})
      // exclude self referencing edges, these are not delegators
      .filter((delegator) => delegator != address)
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

        const delegatedPower = distribute(weights[delegator]!, availablePower)[
          address
        ]!

        return {
          delegator,
          weight: basisPoints(delegatedPower, availablePower),
          delegatedPower,
          parents,
        }
      })
  )
}
