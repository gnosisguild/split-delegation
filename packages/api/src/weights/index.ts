import reduceActions from './reduce'
import filterRegistry from './filter'
import cascadeWeights from './cascade'

import filterNoEdge from 'src/weights/graph/filterNoEdge'
import toAcyclical from 'src/weights/graph/toAcyclical'

import { DelegationAction, Weights } from 'src/types'

export function createDelegatorWeights(
  actions: DelegationAction[],
  when: number
): Weights<bigint> {
  return filterRegistry(reduceActions(actions), when)
}

export function toDelegateWeights(
  delegatorWeights: Weights<bigint>
): Weights<bigint> {
  const [delegateWeights] = [delegatorWeights]
    .map((graph) => toAcyclical(graph))
    .map((dag) => filterNoEdge(dag))
    .map((dag) => cascadeWeights(dag))

  return delegateWeights
}
