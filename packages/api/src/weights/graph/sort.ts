import assert from 'assert'
import { Weights } from '@/src/types'

/**
 * Performs a topological sort using Kahn's algorithm on a directed acyclic
 * graph (DAG).
 *
 * @param {Weights<T>} dag - The directed acyclic graph to be sorted.
 * @returns {string[]} - An array containing the sorted nodes of the DAG.
 */

export default function kahn<T>(dag: Weights<T>): string[] {
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

function all<T>(dag: Weights<T>): string[] {
  // THIS IS SLOW
  // return Array.from(
  //   new Set(
  //     Object.keys(dag).reduce(
  //       (prev, node) => [...prev, node, ...Object.keys(dag[node])],
  //       [] as string[]
  //     )
  //   )
  // )

  const set = new Set<string>()
  Object.keys(dag).forEach((node) => {
    set.add(node)
    Object.keys(dag[node]).forEach((neighbor) => set.add(neighbor))
  })
  return Array.from(set)
}

function neighbors<T>(dag: Weights<T>, node: string): string[] {
  return Object.keys(dag[node] || {})
}
