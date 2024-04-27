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
    result[delegator] = cascadeDelegator(delegatorWeights, delegator)
  }

  return result
}

function cascadeDelegator(
  weights: Weights<bigint>,
  delegator: string
): Record<string, bigint> {
  const result: Record<string, bigint> = {}

  Object.entries(weights[delegator])
    .map(([delegate, weight]) => toLeaves(weights, delegate, weight))
    .flat()
    .forEach(([delegate, weight]) => {
      if (!result[delegate]) {
        result[delegate] = 0n
      }
      result[delegate] += weight
    })

  return result
}

function toLeaves(
  weights: Weights<bigint>,
  edge: string,
  value: bigint
): [string, bigint][] {
  if (Object.keys(weights[edge] || {}).length == 0) {
    return [[edge, value]]
  }

  return distribute(weights[edge], value)
    .map(([edge, value]) => toLeaves(weights, edge, value))
    .flat()
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
