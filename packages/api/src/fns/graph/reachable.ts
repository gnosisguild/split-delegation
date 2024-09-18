import { Graph } from '../../types'

export default function reachable<T>(graph: Graph<T>, root: string): string[] {
  const visited: Record<string, boolean> = {}
  const queue: string[] = [root]

  while (queue.length > 0) {
    const node = queue.shift()!

    for (const neighbor of Object.keys(graph[node] || {})) {
      if (!visited[neighbor]) {
        visited[neighbor] = true
        queue.push(neighbor)
      }
    }
  }

  return Object.keys(visited)
    .filter((node) => node != root)
    .sort()
}
