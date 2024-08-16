import { Graph } from '../../types'

/**
 * Detects cycles in a directed graph using Depth First Search (DFS).
 *
 * The function solves the problem based on the idea that a cycle exists
 * in a directed graph only if there is a back edge (i.e., a node points
 * to one of its ancestors) present in the graph.
 *
 * @returns {boolean} Returns cycle if one detected, otherwise null.
 */

export default function findCycle<T>(
  graph: Graph<T>
): [string, string][] | null {
  const visited = new Set<string>()
  const path: string[] = []

  function visit(node: string): string[] | null {
    if (path.includes(node)) {
      return path.slice(path.indexOf(node))
    }

    if (visited.has(node)) {
      return null
    }

    visited.add(node)
    path.push(node)

    for (const neighbor of neighbors(graph, node)) {
      const cycle = visit(neighbor)
      if (cycle) return cycle
    }

    path.pop()
    return null
  }

  for (const node of Object.keys(graph)) {
    const cycle = visit(node)
    if (cycle) return toCycleEdges(cycle)
  }

  return null
}

function neighbors<T>(graph: Graph<T>, node: string): string[] {
  return Object.keys(graph[node] || {}).filter((neighbor) => neighbor != node)
}

function toCycleEdges(cycle: string[]): [string, string][] {
  return cycle.map((node, index) => [
    node, //from
    cycle[index == cycle.length - 1 ? 0 : index + 1], // to
  ])
}
