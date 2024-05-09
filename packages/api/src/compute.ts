import { Address } from 'viem'

import { distribute } from '../src/fns/bag'
import filterEdges from './fns/graph/filterEdges'
import filterNoEdge from './fns/graph/filterNoEdge'
import kahn from './fns/graph/sort'
import toAcyclical from './fns/graph/toAcyclical'

import { Scores, Weights } from '../src/types'

export default function compute({
  weights,
  scores,
  voters,
}: {
  weights: Weights<bigint>
  scores: Scores
  voters?: Address[]
}) {
  ;[weights] = [weights]
    // Filter out the addresses exercising voting right, from delegator weights
    .map((weights) => (voters ? filterEdges(weights, voters) : weights))
    // Break any potential cycles in the delegator weights
    .map((weights) => toAcyclical(weights))
    // Remove any empty nodes that may remain after cycle busting
    .map((weights) => filterNoEdge(weights))

  const order = kahn(weights)

  return {
    votingPower: votingPower({ order, weights, scores }),
    delegatorCount: delegatorCount({ order, weights, scores }),
  }
}

function votingPower({
  order,
  weights,
  scores,
}: {
  order: string[]
  weights: Weights<bigint>
  scores: Scores
}) {
  const inPower: Scores = { ...scores }
  const outPower: Scores = Object.fromEntries(
    Object.keys(scores).map((address) => [address, 0])
  )

  for (const address of order) {
    const delegator =
      Object.keys(weights[address] || {}).length > 0 ? address : null

    if (delegator) {
      const distribution = distribute(weights[delegator], inPower[delegator])
      for (const [delegate, power] of distribution) {
        outPower[delegator] += power
        inPower[delegate] += power
      }
    }
  }

  const result: Scores = {}
  for (const address of Object.keys(scores)) {
    result[address] = inPower[address] - outPower[address]
  }
  return result
}

function delegatorCount({
  order,
  weights,
  scores,
}: {
  order: string[]
  weights: Weights<bigint>
  scores: Scores
}): Scores {
  const result: Record<string, Record<string, true>> = {}

  for (const delegate of Object.keys(scores)) {
    result[delegate] = {}
  }

  for (const delegator of order) {
    for (const delegate of Object.keys(weights[delegator] || {})) {
      Object.assign(result[delegate], result[delegator], { [delegator]: true })
    }
  }

  const map = Object.fromEntries(
    Object.keys(scores).map((address) => [
      address,
      Object.keys(result[address]).length,
    ])
  )
  map.all = Object.keys(weights).length
  return map
}
