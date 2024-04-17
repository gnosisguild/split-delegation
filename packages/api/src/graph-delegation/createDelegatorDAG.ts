import createRegistry from './createRegistry'
import filterNoEdge from 'src/graph/filterNoEdge'
import registryToGraph from './registryToGraph'
import toAcyclical from 'src/graph/toAcyclical'

import { Graph } from 'src/graph/types'
import { DelegationAction } from 'src/types'

export default function (
  actions: DelegationAction[],
  now: number
): Graph<bigint> {
  const registry = createRegistry(actions)
  const delegatorGraph = registryToGraph(registry, now)
  const delegatorDAG = toAcyclical(delegatorGraph)
  return filterNoEdge(delegatorDAG)
}
