import { Address } from 'viem'

import { Weights } from '../../types'

export default function bfs<T>(weights: Weights<T>, root: string): Address[] {
  const visited: Record<string, boolean> = {}
  const queue: string[] = [root]

  while (queue.length > 0) {
    const node = queue.shift() as Address
    for (const neighbor of Object.keys(weights[node] || {})) {
      if (!visited[neighbor]) {
        visited[neighbor] = true
        queue.push(neighbor)
      }
    }
  }

  return Object.keys(visited).sort() as Address[]
}
