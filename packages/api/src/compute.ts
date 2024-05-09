import { Address } from 'viem'

import { distribute } from '../src/fns/bag'
import bfs from './fns/graph/bfs'
import filterEdges from './fns/graph/filterEdges'
import filterNoEdge from './fns/graph/filterNoEdge'
import inverse from './fns/graph/inverse'
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
    votingPower: votingPower({ weights, scores, order }),
    delegatorCount: delegatorCount({ weights, scores }),
  }
}

function votingPower({
  weights,
  scores,
  order,
}: {
  weights: Weights<bigint>
  scores: Scores
  order: string[]
}) {
  const addresses = Object.keys(scores)
  const inPower: Scores = { ...scores }
  const outPower: Scores = Object.fromEntries(
    addresses.map((address) => [address, 0])
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
  for (const address of addresses) {
    result[address] = inPower[address] - outPower[address]
  }
  return result
}

function delegatorCount({
  weights,
  scores,
}: {
  weights: Weights<bigint>
  scores: Scores
}): Scores {
  const result: Scores = {
    all: Object.keys(weights).length,
  }

  const rweights = inverse(weights)
  for (const address of Object.keys(scores)) {
    result[address] = bfs(rweights, address).length
  }

  return result
}
