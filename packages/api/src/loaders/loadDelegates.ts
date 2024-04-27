import assert from 'assert'
import { Address } from 'viem'

import proportionally from 'src/fns/proportionally'
import { toDelegateWeights } from 'src/weights'

import { Scores, Weights } from 'src/types'
import insideOut from 'src/fns/insideOut'

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

  const delegateWeights = toDelegateWeights(delegatorWeights)

  return {
    weights: delegateWeights,
    power: delegatePower(delegatorScores, delegateWeights),
  }
}

function delegatePower(
  delegatorScores: Scores,
  delegateWeights: Weights<bigint>
) {
  const finalDelegatorWeights = insideOut(delegateWeights)

  const distributions: Weights<number> = {}

  function calcPower(delegate: string) {
    const score = Object.keys(delegateWeights[delegate]).reduce(
      (power, delegator) => {
        if (!distributions[delegator]) {
          // already calculated
          distributions[delegator] = distribute(
            finalDelegatorWeights[delegator],
            delegatorScores[delegator]
          )
        }

        const part = distributions[delegator][delegate]
        assert(typeof part == 'number')
        return power + part
      },
      0
    )
    return score
  }

  const delegates = Object.keys(delegateWeights).sort()
  return Object.fromEntries(
    delegates.map((delegate) => [delegate, calcPower(delegate)])
  )
}

function distribute(
  bag: Record<string, bigint>,
  value: number
): Record<string, number> {
  const keys = Object.keys(bag).sort()
  const weights = keys.map((key) => bag[key])
  const result = proportionally(value, weights)
  return Object.fromEntries(keys.map((key, i) => [key, result[i]]))
}
