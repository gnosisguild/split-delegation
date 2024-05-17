import assert from 'assert'
import allNodes from './allNodes'
import { Graph } from '../../types'

/**
 * Performs a topological sort using Kahn's algorithm on a directed acyclic
 * graph (DAG).
 *
 * @param {Graph} graph - The directed acyclic graph to be sorted.
 * @returns {string[]} - An array containing the sorted nodes of the DAG.
 */

export default function kahn<T>(graph: Graph, more?: string[]): string[] {
  const addresses: string[] = allNodes(graph, more)

  const inDegree = new Map<string, number>()
  for (const address of addresses) {
    inDegree.set(address, 0)
  }

  for (const address of addresses) {
    for (const neighbor of Object.keys(graph[address] || {})) {
      inDegree.set(neighbor, inDegree.get(neighbor)! + 1)
    }
  }

  const pending: string[] = []
  for (const [address, value] of inDegree.entries()) {
    if (value == 0) {
      pending.push(address)
    }
  }

  const sorted: string[] = []
  while (pending.length) {
    const address = pending.shift()!
    sorted.push(address)

    for (const neighbor of Object.keys(graph[address] || {})) {
      inDegree.set(neighbor, inDegree.get(neighbor)! - 1)
      if (inDegree.get(neighbor) == 0) {
        pending.push(neighbor)
      }
    }
  }

  assert(addresses.length == sorted.length, 'Expected no cycles')

  return sorted
}
