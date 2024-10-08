import delegatorTree from './delegatorTree'
import distribution from './distribution'

import { DelegationDAGs, Scores } from '../types'

export type DelegateTreeNode = {
  delegate: string
  expiration: number
  weight: number
  delegatedPower: number
  children: DelegateTreeNode[]
}
export default function delegateTree({
  dags,
  scores,
  address,
}: {
  dags: DelegationDAGs
  scores: Scores
  address: string
}): DelegateTreeNode[] {
  const delegates = Object.keys(dags.forward[address] || {})
    // a self referencing edge is not a delegate
    .filter((delegate) => address != delegate)

  if (delegates.length == 0) {
    return []
  }

  const parents = delegatorTree({
    dags,
    scores,
    address,
  })
  const availablePower =
    scores[address]! +
    parents.reduce((r, { delegatedPower }) => r + delegatedPower, 0)

  return delegates.map((delegate) => {
    const { expiration, weightInBasisPoints, distributedPower } = distribution({
      delegation: dags.forward,
      delegator: address,
      delegate,
      availablePower,
    })
    return {
      delegate,
      expiration,
      weight: weightInBasisPoints,
      delegatedPower: distributedPower,
      children: delegateTree({
        dags,
        scores,
        address: delegate,
      }),
    }
  })
}
