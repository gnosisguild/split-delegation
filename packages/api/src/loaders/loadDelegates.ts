import assert from 'assert'
import { Address } from 'viem'

import proportionally from 'src/fns/proportionally'
import { toDelegateWeights } from 'src/weights'

import { Scores, Weights } from 'src/types'

export default function loadDelegates({
  delegatorWeights,
  delegatorScores,
  addresses,
}: {
  delegatorWeights: Weights<bigint>
  delegatorScores: Scores
  addresses: Address[]
}) {
  // remove delegators that have voted
  delegatorWeights = Object.fromEntries(
    Object.entries(delegatorWeights).filter(
      ([key]) => !addresses.includes(key as Address)
    )
  )

  const weights = toDelegateWeights(delegatorWeights)
  const scores = delegateScores(
    delegatorWeights,
    delegatorScores,
    delegatorWeights
  )

  return { weights, scores }
}

function delegateScores(
  outWeights: Weights<bigint>,
  delegatorScores: Scores,
  inWeights: Weights<bigint>
) {
  const bag: Weights<number> = {}

  function calcDistribution(delegator: string) {
    if (bag[delegator]) {
      // already calculated
      return
    }

    const score = delegatorScores[delegator]
    const delegates = Object.keys(outWeights[delegator])
    const ratios = Object.values(inWeights[delegator])
    const values = proportionally(score, ratios)
    assert(delegates.length == values.length)
    bag[delegator] = Object.fromEntries(
      delegates.map((delegate, index) => [delegate, values[index]])
    )
  }

  function calcScore(delegate: string) {
    const score = Object.keys(inWeights[delegate]).reduce(
      (score, delegator) => {
        calcDistribution(delegator)

        const part = bag[delegator][delegate]
        assert(typeof part == 'number')

        return score + part
      },
      0
    )
    return score
  }

  const delegates = Object.keys(inWeights)
  return Object.fromEntries(
    delegates.map((delegate) => [delegate, calcScore(delegate)])
  )
}
