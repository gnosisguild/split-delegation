import { Weights } from 'src/types'
import inverse from './inverse'

export default function createDelegatedPower({
  delegatorDistribution,
}: {
  delegatorDistribution: Weights<number>
}) {
  const delegateDistribution = inverse(delegatorDistribution)
  return Object.fromEntries(
    Object.entries(delegateDistribution).map(([delegate, distribution]) => [
      delegate,
      Object.values(distribution).reduce((p, v) => p + v, 0),
    ])
  )
}
