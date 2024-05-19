import { Graph } from '../../types'

export default function inverse(graph: Graph): Graph {
  const result: Graph = {}

  for (const [a, bag] of Object.entries(graph)) {
    for (const [b, value] of Object.entries(bag)) {
      if (!result[b]) {
        result[b] = {}
      }
      result[b][a] = value
    }
  }
  return result
}
