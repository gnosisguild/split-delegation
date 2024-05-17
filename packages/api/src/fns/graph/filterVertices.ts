import { Graph } from '../../types'

export default function filterVertices(
  graph: Graph,
  vertices: string[]
): Graph {
  const exclusion = new Set(vertices)

  return Object.fromEntries(
    Object.entries(graph).filter(([vertex]) => !exclusion.has(vertex))
  )
}
