import { Address } from 'viem'

import { Weights } from '../../../src/types'

export default function bfs<T>(weights: Weights<T>, root: string): Address[] {
  const queue: string[] = [root]
  const visited: Record<string, boolean> = {}

  while (queue.length > 0) {
    const node = queue.pop() as Address
    for (const neighbor of Object.keys(weights[node] || {})) {
      if (!visited[neighbor as Address]) {
        visited[neighbor] = true
        queue.push(neighbor)
      }
    }
  }

  return Object.keys(visited).sort() as Address[]
}
