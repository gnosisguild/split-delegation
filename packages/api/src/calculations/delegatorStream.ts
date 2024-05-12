import bfs from '../fns/graph/bfs'
import delegateStream from './delegateStream'
import inverse from '../fns/graph/inverse'
import kahn from '../fns/graph/sort'

import { Scores, Weights } from '../types'

export default function ({
  weights,
  scores,
  order,
  toDelegate,
}: {
  weights: Weights<bigint>
  scores: Scores
  order?: string[]
  toDelegate: string
}) {
  const delegators = bfs(inverse(weights), toDelegate)

  /*
   * Compute order if not provided.
   */
  order = order || kahn(weights)

  return delegators.map((delegator) =>
    flow({
      weights,
      scores,
      order,
      delegator,
      delegate: toDelegate,
    })
  )
}

function flow({
  weights,
  scores,
  order,
  delegate,
  delegator,
}: {
  weights: Weights<bigint>
  scores: Scores
  order: string[]
  delegator: string
  delegate: string
}) {
  const from = delegator
  const to = delegate

  // make it stop at the destination
  weights = Object.fromEntries(
    Object.entries(weights).filter(([key]) => key != to)
  )

  const { direct, delegatedPower } = delegateStream({
    weights,
    score: scores[delegator]!,
    order,
    fromDelegator: from,
  }).find((entry) => entry.address == to)!

  return {
    address: delegator,
    direct,
    delegatedPower,
  }
}
