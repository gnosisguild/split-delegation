import assert from 'assert'

import kahn from 'src/weights/graph/sort'
import proportionally from 'src/fns/proportionally'
import { Weights } from 'src/types'

/**
 * Goes from delegatorDAG -> delegatesDAG
 *
 * Builds the voting leafs, which is what remains after all transitivity
 *
 * The graph input is guaranteed to be an acyclic graph, and weights are
 * propagated via edges
 */
export default function (delegatorDAG: Weights<bigint>): Weights<bigint> {
  const order = kahn(delegatorDAG)

  let result: Weights<bigint> = {}
  for (const node of order) {
    const delegatedByNode = delegatorDAG[node]
    if (!delegatedByNode) {
      // if its a leaf we exit
      continue
    }

    assert(Object.keys(delegatedByNode).length > 0)

    const own = Object.values(delegatedByNode).reduce((p, n) => p + n, 0n)
    const delegatedToNode =
      own > 0
        ? {
            ...(result[node] || {}),
            [node]: own,
          }
        : result[node] || {}

    for (const delegator of Object.keys(delegatedToNode)) {
      const valueIn = delegatedToNode[delegator]
      const valuesOut = proportionally(valueIn, Object.values(delegatedByNode))

      const delegates = Object.keys(delegatedByNode)
      for (let i = 0; i < delegates.length; i++) {
        result = set(result, {
          delegate: delegates[i],
          delegator,
          value: valuesOut[i],
        })
      }
    }

    // if we're here its not a leaf. delete all non leafs
    delete result[node]
  }

  return result
}

function set(
  result: Weights<bigint>,
  {
    delegate,
    delegator,
    value,
  }: { delegate: string; delegator: string; value: bigint }
) {
  if (!result[delegate]) {
    result[delegate] = {}
  }

  if (!result[delegate][delegator]) {
    result[delegate][delegator] = 0n
  }

  result[delegate][delegator] += value

  return result
}

// THIS
// function set(
//   result: Weights<bigint>,
//   {
//     delegate,
//     delegator,
//     value,
//   }: { delegate: string; delegator: string; value: bigint }
// ) {
//   return {
//     ...result,
//     [delegate]: {
//       ...(result[delegate] || {}),
//       [delegator]:
//         ((result[delegate] && result[delegate][delegator]) || BigInt(0)) +
//         value,
//     },
//   }
// }
