import { DAG } from './types'

/**
 * Detects cycles in a directed graph using Depth First Search (DFS).
 *
 * The function solves the problem based on the idea that a cycle exists
 * in a directed graph only if there is a back edge (i.e., a node points
 * to one of its ancestors) present in the graph.
 *
 * @returns {boolean} Returns cycle if one detected, otherwise null.
 */

export function findCycle<T>(dag: DAG<T>): string[] | null {
  const visited = new Set<string>()
  const path: string[] = []

  for (const node of Object.keys(dag)) {
    const cycle = dfs(dag, node, visited, path)
    if (cycle) return cycle
  }

  return null
}

function dfs<T>(
  dag: DAG<T>,
  node: string,
  visited: Set<string>,
  path: string[]
): string[] | null {
  if (visited.has(node)) {
    return null
  }

  visited.add(node)
  path.push(node)

  for (const neighbor of neighbors(dag, node)) {
    const cycle = dfs(dag, neighbor, visited, path)
    if (cycle) {
      return cycle
    }

    if (path.includes(neighbor)) {
      return path.slice(path.indexOf(neighbor))
    }
  }

  path.pop()
  return null
}

function neighbors<T>(dag: DAG<T>, node: string): string[] {
  return Object.keys(dag[node] || {})
}
