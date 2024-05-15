import { Weights } from '../../types'

export default function filterVertices(
  weights: Weights,
  vertices: string[]
): Weights {
  const exclusion = new Set(vertices)

  return Object.fromEntries(
    Object.entries(weights).filter(([vertex]) => !exclusion.has(vertex))
  )
}
