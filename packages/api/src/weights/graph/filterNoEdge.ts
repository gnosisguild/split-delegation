import { Weights } from '../../../src/types'

export default function filterNoEdge<T>(weights: Weights<T>): Weights<T> {
  let result
  for (const node of Object.keys(weights)) {
    if (Object.keys(weights[node]).length > 0) {
      continue
    }

    result = result || { ...weights }
    delete result[node]
  }
  return result || weights
}
