import createRegistry from './createRegistry'
import { filterExpired, filterOptOuts } from './registryFilter'

import { DelegationAction, Weights } from 'src/types'
import { Registry } from './types'

export default function createWeights(
  actions: DelegationAction[],
  when: number
): Weights<bigint> {
  const [weights] = [createRegistry(actions)]
    .map((registry) => filterExpired(registry, when))
    .map((registry) => filterOptOuts(registry))
    .map((registry) => toWeights(registry))

  return weights
}

function toWeights(registry: Registry): Weights<bigint> {
  const graph: Weights<bigint> = {}
  for (const [key, { delegation }] of Object.entries(registry)) {
    graph[key] = {}
    for (const { delegate, ratio } of delegation) {
      graph[key][delegate] = ratio
    }
  }
  return graph
}
