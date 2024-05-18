import distribute from '../fns/distribute'

import { Graph, Scores } from '../types'

export default function incomingPower({
  weights,
  rweights,
  scores,
  address,
}: {
  weights: Graph
  rweights: Graph
  scores: Scores
  address: string
}) {
  const delegators = Object.keys(rweights[address] || {})

  return delegators.reduce((result, delegator) => {
    const availablePower: number =
      scores[delegator]! +
      incomingPower({ weights, rweights, scores, address: delegator })

    return result + distribute(weights[delegator], availablePower)[address]!
  }, 0)
}
