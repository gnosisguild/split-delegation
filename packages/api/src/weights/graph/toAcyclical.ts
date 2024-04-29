import assert from 'assert'
import findCycle from './findCycle'
import { Weights } from 'src/types'

export default function toAcyclical<T>(graph: Weights<T>): Weights<T> {
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

function removeEdge<T>(dag: Weights<T>, from: string, to: string): Weights<T> {
  return {
    ...dag,
    [from]: Object.keys(dag[from])
      .filter((key) => key != to)
      .reduce((prev, to) => ({ ...prev, [to]: dag[from][to] }), {}),
  }
}
