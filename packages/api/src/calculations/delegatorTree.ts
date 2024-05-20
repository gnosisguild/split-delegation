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

      return {
        delegator,
        weight: weight(weights, delegator, address),
        delegatedPower: distribute(weights[delegator]!, availablePower)[
          address
        ]!,
        parents,
      }
    })
}

function weight(weights: Graph, from: string, to: string) {
  return basisPoints(
    weights[from][to]!,
    Object.values(weights[from]).reduce((p, v) => p + v, 0)
  )
}
