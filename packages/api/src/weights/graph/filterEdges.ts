import { Weights } from '../../../src/types'
import { Address } from 'viem'

export default function filterEdges<T>(
  weights: Weights<T>,
  addresses: string[]
): Weights<T> {
  return Object.fromEntries(
    Object.entries(weights).filter(
      ([key]) => !addresses.includes(key as Address)
    )
  )
}
