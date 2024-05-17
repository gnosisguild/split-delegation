import assert from 'assert'
import findCycle from './findCycle'
import filterEdge from './filterEdge'

import { Graph } from '../../types'

export default function toAcyclical(graph: Graph): Graph {
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
