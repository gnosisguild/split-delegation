import { Graph } from './types'

export default function filterNoEdge<T>(graph: Graph<T>): Graph<T> {
  let result
  for (const node of Object.keys(graph)) {
    if (Object.keys(graph[node]).length > 0) {
      continue
    }

    result = result || { ...graph }
    delete result[node]
  }
  return result || graph
}
