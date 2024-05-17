import { Graph } from '../../types'

export default function (weights: Graph, from: string, to: string): Graph {
  const entries = Object.entries(weights)
    .map(([key, value]) => [
      key,
      key == from
        ? Object.fromEntries(Object.entries(value).filter(([key]) => key != to))
        : value,
    ])
    .filter(([key, value]) => key != from || Object.keys(value).length > 0)

  return Object.fromEntries(entries)
}
