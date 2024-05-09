import { Address } from 'viem'
import { Weights } from '../../types'

export default function allNodes<T>(weights: Weights<T>): Address[] {
  const set = new Set<Address>()
  for (const delegator of Object.keys(weights)) {
    set.add(delegator as Address)

    for (const delegate of Object.keys(weights[delegator])) {
      set.add(delegate as Address)
    }
  }
  return Array.from(set).sort()
}
