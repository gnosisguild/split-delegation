import { distribute } from '../fns/bag'
import { Scores, Weights } from '../types'

export default function calculateVotingPower({
  weights,
  scores,
  order,
}: {
  weights: Weights
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
