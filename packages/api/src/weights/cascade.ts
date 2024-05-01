import { distribute } from '../../src/fns/bag'
import { Weights } from '../../src/types'

/**
 *
 * Builds weights from root (delegator) to leaf (delegate)
 *
 * The input is guaranteed to be acyclic, and weights are propagated via
 * delegation edges
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
