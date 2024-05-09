import { Registry, Weights } from '../types'

export default function createWeights(registry: Registry): Weights<bigint> {
  const graph: Weights<bigint> = {}
  for (const [key, { delegation }] of Object.entries(registry)) {
    graph[key] = {}
    for (const { delegate, ratio } of delegation) {
      graph[key][delegate] = ratio
    }
  }
  return graph
}
