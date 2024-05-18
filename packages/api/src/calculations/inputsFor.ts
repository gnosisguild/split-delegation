import reachable from 'src/fns/graph/reachable'
import { Graph } from 'src/types'

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
