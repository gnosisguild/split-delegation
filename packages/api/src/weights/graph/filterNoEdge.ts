import { Weights } from 'src/types'

export default function filterNoEdge<T>(graph: Weights<T>): Weights<T> {
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
