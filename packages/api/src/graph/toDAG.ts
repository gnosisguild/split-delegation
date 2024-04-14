import assert from 'assert'
import findCycle from './findCycle'
import { Graph } from './types'

export default function toDAG<T>(graph: Graph<T>): Graph<T> {
  while (true) {
    const cycle = findCycle(graph)
    if (!cycle) {
      return graph
    }

    assert(cycle.length > 1)
    const [from, to] = cycle
    graph = removeEdge(graph, from, to)
  }
}

function removeEdge<T>(dag: Graph<T>, from: string, to: string): Graph<T> {
  return {
    ...dag,
    [from]: Object.keys(dag[from])
      .filter((key) => key != to)
      .reduce((prev, to) => ({ ...prev, [to]: dag[from][to] }), {}),
  }
}
