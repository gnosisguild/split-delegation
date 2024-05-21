import reachable from '../graph/reachable'
import { Graph } from '../../types'

export default function inputsFor(
  input:
    | {
        rweights: Graph
        addresses: string[]
      }
    | {
        rweights: Graph
        address: string
      }
): string[] {
  const { rweights } = input
  const addresses = 'addresses' in input ? input.addresses : [input.address]

  return Array.from(
    new Set([
      ...addresses,
      ...addresses.map((address) => reachable(rweights, address)).flat(),
    ])
  ).sort()
}
