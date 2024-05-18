import reachable from './reachable'
import { Graph } from '../../types'

export default function inputsFor(
  rweights: Graph,
  addresses: string[]
): string[] {
  return Array.from(
    new Set([
      ...addresses,
      ...addresses.map((address) => reachable(rweights, address)).flat(),
    ])
  ).sort()
}
