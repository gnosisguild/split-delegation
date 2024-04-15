import assert from 'assert'
import kahn from '../graph/sort'
import { Graph } from '../graph/types'
import distributeProportionally from '../fns/distributeProportionally'

/**
 * Goes from delegatorDAG -> delegatesDAG
 *
 * Builds the voting leafs, which is what remains after all transitivity
 *
 * The graph input is guaranteed to be an acyclic graph, and weights are
 * propagated via edges
 */
export default function (delegatorDAG: Graph<bigint>): Graph<bigint> {
  const order = kahn(delegatorDAG)

  let result: Graph<bigint> = {}
  for (const node of order) {
    const delegatedByNode = delegatorDAG[node]
    if (!delegatedByNode) {
      // if its a leaf we exit
      continue
    }

    assert(Object.keys(delegatedByNode).length > 0)

    const own = Object.values(delegatorDAG[node] || {}).reduce(
      (p, n) => p + n,
      0n
    )
    const delegatedToNode = {
      ...(result[node] || {}),
      ...(own > 0 ? { [node]: own } : {}),
    }

    for (const delegator of Object.keys(delegatedToNode)) {
      const valueIn = delegatedToNode[delegator]
      const valuesOut = distributeProportionally(
        valueIn,
        Object.values(delegatedByNode)
      )

      const out = Object.keys(delegatedByNode).map((delegate, index) => ({
        delegate,
        valueOut: valuesOut[index],
      }))

      for (const { delegate, valueOut } of out) {
        result = merge(result, {
          delegator,
          delegate,
          value: valueOut,
        })
      }
    }

    delete result[node]
  }

  return result
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
