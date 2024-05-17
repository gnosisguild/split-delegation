import { Address } from 'viem'

import { Graph } from '../../types'

export default function bfs(graph: Graph, root: string): Address[] {
  const visited: Record<string, boolean> = {}
  const queue: string[] = [root]

  while (queue.length > 0) {
    const node = queue.shift() as Address
    for (const neighbor of Object.keys(graph[node] || {})) {
      if (!visited[neighbor]) {
        visited[neighbor] = true
        queue.push(neighbor)
      }
    }
  }

  return Object.keys(visited).sort() as Address[]
}
