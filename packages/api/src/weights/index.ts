import createRegistry from './createRegistry'
import registryToGraph from './registryToGraph'
import cascadeWeights from './cascadeWeights'

import filterNoEdge from 'src/weights/graph/filterNoEdge'
import toAcyclical from 'src/weights/graph/toAcyclical'

import { Graph } from 'src/weights/graph/types'
import { DelegationAction } from 'src/types'

export function createDelegatorWeights(
  actions: DelegationAction[],
  when: number
): Graph<bigint> {
  return registryToGraph(createRegistry(actions), when)
}

export function toDelegateWeights(
  delegatorWeights: Graph<bigint>
): Graph<bigint> {
  const [delegateWeights] = [delegatorWeights]
    .map((graph) => toAcyclical(graph))
    .map((dag) => filterNoEdge(dag))
    .map((dag) => cascadeWeights(dag))

  return delegateWeights
}
