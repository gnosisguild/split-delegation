import assert from 'assert'
import kahn from '../graph/sort'
import { Graph } from '../graph/types'

/**
 * Starts with a delegator graph, and returns the delegates graph
 *
 * The graph input is guaranteed to be an acyclic graph, and weights
 * and transitively propagated via edges, until the leafs exist
 *
 */
export default function (delegatorGraph: Graph<bigint>): Graph<bigint> {
  const order = kahn(delegatorGraph)

  let result: Graph<bigint> = {}
  for (const node of order) {
    const delegatedByNode = delegatorGraph[node]
    if (!delegatedByNode) {
      continue
    }

    assert(Object.keys(delegatedByNode).length > 0)

    const own = sum(Object.values(delegatorGraph[node] || {}))
    const delegatedToNode = {
      ...(result[node] || {}),
      ...(own > 0 ? { [node]: own } : {}),
    }

    for (const delegator of Object.keys(delegatedToNode)) {
      const valueIn = delegatedToNode[delegator]
      const distribution = calcDistribution(delegatedByNode, valueIn)

      for (const delegate of Object.keys(distribution)) {
        const valueOut = distribution[delegate]
        result = merge(result, {
          delegator,
          delegate,
          value: valueOut,
        })
      }
    }

    // only keep the leafs
    if (Object.keys(delegatedByNode).length > 0) {
      delete result[node]
    }
  }

  return result
}

function calcDistribution(
  config: Record<string, bigint>,
  valueIn: bigint
): Record<string, bigint> {
  const delegates = Object.keys(config)
  const ratios = Object.values(config)
  const scale = sum(ratios)

  let valuesOut = ratios.map((ratio) => (ratio * valueIn) / scale)
  const adjustment = valueIn - sum(valuesOut)

  valuesOut = [
    ...valuesOut.slice(0, -1),
    valuesOut[valuesOut.length - 1] + adjustment,
  ]

  assert(valueIn == sum(valuesOut))

  return delegates.reduce(
    (result, delegate, index) => ({
      ...result,
      [delegate]: valuesOut[index],
    }),
    {}
  )
}

function merge(
  result: Graph<bigint>,
  {
    delegate,
    delegator,
    value,
  }: { delegate: string; delegator: string; value: bigint }
) {
  return {
    ...result,
    [delegate]: {
      ...(result[delegate] || {}),
      [delegator]:
        ((result[delegate] && result[delegate][delegator]) || BigInt(0)) +
        value,
    },
  }
}

function sum(values: bigint[]): bigint {
  return values.reduce((p, n) => p + n, BigInt(0))
}
