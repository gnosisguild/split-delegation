import { Graph } from '../../types'

export default function filterVertices<T>(
  graph: Graph<T>,
  vertices: string[]
): Graph<T> {
  const exclusion = new Set(vertices)

  return Object.fromEntries(
    Object.entries(graph).filter(([vertex]) => !exclusion.has(vertex))
  )
}
