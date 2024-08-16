import { Graph } from '../../types'

export default function allNodes<T>(weights: Graph<T>): string[] {
  const set = new Set<string>()
  for (const delegator of Object.keys(weights)) {
    set.add(delegator)

    for (const delegate of Object.keys(weights[delegator])) {
      set.add(delegate)
    }
  }
  return Array.from(set).sort()
}
