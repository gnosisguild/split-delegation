import { Address, getAddress } from 'viem'

import { Weights } from '../../types'

export default function allNodes(weights: Weights<bigint>): Address[] {
  const set = new Set<Address>()
  Object.keys(weights).forEach((key) => {
    set.add(getAddress(key))

    Object.keys(weights[key]).forEach((neighbor) =>
      set.add(neighbor as Address)
    )
  })
  return Array.from(set).sort()
}
