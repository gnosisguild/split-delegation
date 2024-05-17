import { Address } from 'viem'
import { Graph } from '../../types'

export default function allNodes(graph: Graph, more?: string[]): Address[] {
  const set = new Set<string>(more || [])
  for (const from of Object.keys(graph)) {
    set.add(from)

    for (const to of Object.keys(graph[from])) {
      set.add(to)
    }
  }
  return Array.from(set).sort() as Address[]
}
