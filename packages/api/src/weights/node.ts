import { Address, getAddress } from 'viem'

import { Weights } from 'src/types'

export function all(weights: Weights<bigint>): Address[] {
  const set = new Set<Address>()
  Object.keys(weights).forEach((key) => {
    set.add(getAddress(key))
    const neighbors = Object.keys(weights[key]) as Address[]
    neighbors.forEach((neighbor) => set.add(neighbor))
  })
  return Array.from(set).sort()
}
