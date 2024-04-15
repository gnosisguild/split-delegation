import reduceRegistry, { RegistryEntry } from './reduceRegistry'
import toAcyclical from 'src/graph/toAcyclical'

import { Graph } from 'src/graph/types'
import { DelegationEvent } from 'src/types'

export default function (
  events: DelegationEvent[],
  now: number
): Graph<bigint> {
  const registry = reduceRegistry(events, now)
  const delegatorGraph = registryToGraph(registry)
  const delegatorDAG = toAcyclical(delegatorGraph)
  return delegatorDAG
}

function registryToGraph(
  registry: Record<string, RegistryEntry>
): Graph<bigint> {
  return Object.keys(registry).reduce((result, account) => {
    const { delegation } = registry[account]
    return {
      ...result,
      [account]: delegation.reduce(
        (result, { delegate, ratio }) => ({ ...result, [delegate]: ratio }),
        {}
      ),
    }
  }, {})
}
