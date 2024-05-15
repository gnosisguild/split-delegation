import { Address } from 'viem'
import { Weights } from '../../types'

export default function allNodes(weights: Weights, more?: string[]): Address[] {
  const set = new Set<string>(more || [])
  for (const delegator of Object.keys(weights)) {
    set.add(delegator)

    for (const delegate of Object.keys(weights[delegator])) {
      set.add(delegate)
    }
  }
  return Array.from(set).sort() as Address[]
}
