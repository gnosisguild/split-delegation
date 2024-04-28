import proportionally from 'src/fns/proportionally'
import { Weights } from 'src/types'

/**
 *
 * Builds the voting leafs, which is what remains after all transitivity
 *
 * The graph input is guaranteed to be an acyclic graph, and weights are
 * propagated via edges
 */
export default function (delegatorWeights: Weights<bigint>): Weights<bigint> {
  const result: Weights<bigint> = {}

  for (const delegator of Object.keys(delegatorWeights)) {
    result[delegator] = Object.entries(delegatorWeights[delegator])
      .flatMap(([delegate, weight]) =>
        flowUntilLeaf(delegatorWeights, delegate, weight)
      )
      .reduce((result: Record<string, bigint>, [delegate, weight]) => {
        result[delegate] = (result[delegate] || 0n) + weight
        return result
      }, {})
  }

  return result
}

function flowUntilLeaf(
  weights: Weights<bigint>,
  edge: string,
  value: bigint
): [string, bigint][] {
  if (Object.keys(weights[edge] || {}).length == 0) {
    return [[edge, value]]
  }

  return distribute(weights[edge], value).flatMap(([edge, value]) =>
    flowUntilLeaf(weights, edge, value)
  )
}

function distribute(
  bag: Record<string, bigint>,
  value: bigint
): [string, bigint][] {
  const keys = Object.keys(bag).sort()
  const weights = keys.map((key) => bag[key])
  const result = proportionally(value, weights)
  return keys.map((key, i) => [key, result[i]])
}
