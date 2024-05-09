import assert from 'assert'
import allNodes from './allNodes'
import { Weights } from '../../types'

/**
 * Performs a topological sort using Kahn's algorithm on a directed acyclic
 * graph (DAG).
 *
 * @param {Weights<T>} dag - The directed acyclic graph to be sorted.
 * @returns {string[]} - An array containing the sorted nodes of the DAG.
 */

export default function kahn<T>(dag: Weights<T>): string[] {
  const inDegree = new Map<string, number>()
  const addresses = allNodes(dag)
  for (const address of addresses) {
    inDegree.set(address, 0)
  }

  for (const address of addresses) {
    for (const neighbor of neighbors(dag, address)) {
      inDegree.set(neighbor, (inDegree.get(neighbor) as number) + 1)
    }
  }

  const pending: string[] = []
  for (const address of addresses) {
    if (inDegree.get(address) == 0) {
      pending.push(address)
    }
  }

  const result: string[] = []
  while (pending.length) {
    const address = pending.shift() as string
    for (const neighbor of neighbors(dag, address)) {
      inDegree.set(neighbor, (inDegree.get(neighbor) as number) - 1)
      if (inDegree.get(neighbor) == 0) {
        pending.push(neighbor)
      }
    }
    result.push(address)
  }

  assert(addresses.length == result.length, 'Expected no cycles')

  return result
}

function neighbors<T>(dag: Weights<T>, node: string): string[] {
  return Object.keys(dag[node] || {})
}
