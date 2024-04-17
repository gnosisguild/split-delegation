import assert from 'assert'
import { Graph } from './types'

/**
 * Performs a topological sort using Kahn's algorithm on a directed acyclic
 * graph (DAG).
 *
 * @param {Graph<T>} dag - The directed acyclic graph to be sorted.
 * @returns {string[]} - An array containing the sorted nodes of the DAG.
 */

export default function kahn<T>(dag: Graph<T>): string[] {
  const inDegree = new Map<string, number>()
  const nodes = all(dag)
  for (const node of nodes) {
    inDegree.set(node, 0)
  }

  for (const node of nodes) {
    for (const neighbor of neighbors(dag, node)) {
      inDegree.set(neighbor, (inDegree.get(neighbor) as number) + 1)
    }
  }

  const pending: string[] = []
  for (const node of nodes) {
    if (inDegree.get(node) == 0) {
      pending.push(node)
    }
  }

  const result: string[] = []
  while (pending.length) {
    const node = pending.shift() as string
    for (const neighbor of neighbors(dag, node)) {
      inDegree.set(neighbor, (inDegree.get(neighbor) as number) - 1)
      if (inDegree.get(neighbor) == 0) {
        pending.push(neighbor)
      }
    }
    result.push(node)
  }

  assert(nodes.length == result.length, 'Expected no cycles')

  return result
}

function all<T>(dag: Graph<T>): string[] {
  return Array.from(
    new Set(
      Object.keys(dag).reduce(
        (prev, node) => [...prev, node, ...Object.keys(dag[node])],
        [] as string[]
      )
    )
  )
}

function neighbors<T>(dag: Graph<T>, node: string): string[] {
  return Object.keys(dag[node] || {})
}
