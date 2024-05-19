import { Graph } from '../../types'

/**
 * Detects cycles in a directed graph using Depth First Search (DFS).
 *
 * The function solves the problem based on the idea that a cycle exists
 * in a directed graph only if there is a back edge (i.e., a node points
 * to one of its ancestors) present in the graph.
 *
 */
export default function hasCycle(graph: Graph): boolean {
  const visited: Set<string> = new Set()
  const stack: string[] = []

  function visit(node: string): boolean {
    if (stack.includes(node)) {
      return true
    }

    if (visited.has(node)) {
      return false
    }

    visited.add(node)
    stack.push(node)

    for (const neighbor of neighbors(graph, node)) {
      if (visit(neighbor)) {
        return true
      }
    }

    stack.pop()
    return false
  }

  for (const node of Object.keys(graph)) {
    if (visit(node)) {
      return true
    }
  }

  return false
}

function neighbors(graph: Graph, node: string) {
  // filter out sel-referencing edges
  return Object.keys(graph[node] || {}).filter((neighbor) => neighbor != node)
}
