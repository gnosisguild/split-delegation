import assert from 'assert'

import findCycle from '../graph/findCycle'

import { Delegation } from './types'
import { Graph } from '../../types'

export default function createGraph(
  delegations: Delegation[]
): Graph<{ expiration: number; weight: number }> {
  const result: Graph<{ expiration: number; weight: number }> = {}
  for (const { delegator, delegate, weight, expiration } of delegations) {
    result[delegator] = result[delegator] || {}
    result[delegator][delegate] = { weight, expiration }
  }

  const cycle = findCycle(result)
  return cycle ? createGraph(filterOldestCycleEdge(delegations, cycle)) : result
}

/*
 * Idea is that the edge that created the cycle is the one that gets busted
 */
function filterOldestCycleEdge(
  edges: Delegation[],
  cycle: [string, string][]
): Delegation[] {
  const entries = cycle
    .map(([from, to]) =>
      edges.findIndex(
        ({ delegator, delegate }) => delegator == from && delegate == to
      )
    )
    .sort()
    // oldest first
    .reverse()

  assert(entries.every((index) => index != -1))

  const [indexToRemove] = entries
  return edges.filter((_, index) => index != indexToRemove)
}
