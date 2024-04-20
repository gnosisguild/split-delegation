import cascadeDelegators from './cascadeDelegators.'
import createRegistry from './createRegistry'
import registryToGraph from './registryToGraph'

import filterNoEdge from 'src/delegate-dag/graph/filterNoEdge'
import toAcyclical from 'src/delegate-dag/graph/toAcyclical'

import { Graph } from 'src/delegate-dag/graph/types'
import { DelegationAction } from 'src/types'

export default function createDelegateDAG(
  actions: DelegationAction[],
  when: number
): Graph<bigint> {
  const [delegateDAG] = [createRegistry(actions)]
    .map((registry) => registryToGraph(registry, when))
    .map((graph) => toAcyclical(graph))
    .map((dag) => filterNoEdge(dag))
    .map((dag) => cascadeDelegators(dag))

  return delegateDAG
}
