import { Graph } from '../../types'

export default function inverse<T>(graph: Graph<T>): Graph<T> {
  const result: Graph<T> = {}

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
