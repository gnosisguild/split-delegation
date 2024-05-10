import { Weights } from '../../types'

export default function filterVertices<T>(
  weights: Weights<T>,
  vertices: string[]
): Weights<T> {
  const exclusion = new Set(vertices)

  return Object.fromEntries(
    Object.entries(weights).filter(([vertex]) => !exclusion.has(vertex))
  )
}
