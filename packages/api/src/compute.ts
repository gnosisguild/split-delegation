import { Address } from 'viem'

import { distribute } from '../src/fns/bag'
import filterEdges from './weights/graph/filterEdges'
import filterNoEdge from './weights/graph/filterNoEdge'
import kahn from './weights/graph/sort'
import toAcyclical from './weights/graph/toAcyclical'

import { Scores, Weights } from '../src/types'

export default function computePower({
  weights,
  scores,
  alreadyVoted,
}: {
  weights: Weights<bigint>
  scores: Scores
  alreadyVoted?: Address[]
}) {
  ;[weights] = [weights]
    // Filter out the already voted addresses from the delegator weights
    .map((weights) =>
      alreadyVoted ? filterEdges(weights, alreadyVoted) : weights
    )
    // Break any potential cycles in the delegator weights
    .map((weights) => toAcyclical(weights))
    // Remove any empty nodes that may remain after cycle busting
    .map((weights) => filterNoEdge(weights))

  const order = kahn(weights)

  return {
    delegatedPower: delegatedPower({ order, weights, scores }),
    delegatorCount: delegatorCount({ order, weights }),
  }
}

function delegatedPower({
  order,
  weights,
  scores,
}: {
  order: string[]
  weights: Weights<bigint>
  scores: Scores
}) {
  const inPower: Scores = Object.fromEntries(order.map((node) => [node, 0]))
  const outPower: Scores = { ...inPower }

  const result: Scores = {}

  for (const delegator of order) {
    inPower[delegator] += scores[delegator]

    const hasOut = Object.keys(weights[delegator] || {}).length > 0
    if (hasOut) {
      const distribution = distribute(weights[delegator], inPower[delegator])
      for (const [delegate, power] of distribution) {
        outPower[delegator] += power
        inPower[delegate] += power
      }
    }

    result[delegator] = inPower[delegator] - outPower[delegator]
  }
  return result
}

function delegatorCount({
  order,
  weights,
}: {
  order: string[]
  weights: Weights<bigint>
}) {
  const result: Scores = {
    all: Object.keys(weights).length,
  }

  for (const delegator of order) {
    result[delegator] = 0
  }

  for (const delegator of order) {
    for (const delegate of Object.keys(weights[delegator] || {})) {
      result[delegate] += result[delegator] + 1
    }
  }
  return result
}
