import assert from 'assert'
import findCycle from './findCycle'
import filterEdge from './filterEdge'

import { Weights } from '../../types'

export default function toAcyclical<T>(graph: Weights<T>): Weights<T> {
  while (true) {
    const cycle = findCycle(graph)
    if (!cycle) {
      return graph
    }

    assert(cycle.length > 1)
    const [from, to] = cycle
    graph = filterEdge(graph, from, to)
  }
}
