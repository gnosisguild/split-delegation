import { Graph } from '../../types'

export default function inverse<T>(graph: Graph) {
  let result: Graph = {}

  for (const a of Object.keys(graph)) {
    for (const b of Object.keys(graph[a])) {
      if (!result[b]) {
        result[b] = {}
      }
      result[b][a] = graph[a][b]
    }
  }
  return result
}
