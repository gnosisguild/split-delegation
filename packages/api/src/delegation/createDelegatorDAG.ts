import createRegistry from './createRegistry'
import registryToGraph from './registryToGraph'
import toAcyclical from 'src/graph/toAcyclical'

import { Graph } from 'src/graph/types'
import { DelegationEvent } from 'src/types'

export default function (
  events: DelegationEvent[],
  now: number
): Graph<bigint> {
  const registry = createRegistry(events)
  const delegatorGraph = registryToGraph(registry, now)
  const delegatorDAG = toAcyclical(delegatorGraph)
  return delegatorDAG
}
