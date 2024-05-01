import { Weights } from '../../src/types'

export default function inverse<T>(weights: Weights<T>) {
  let result: Weights<T> = {}

  for (const a of Object.keys(weights)) {
    for (const b of Object.keys(weights[a])) {
      if (!result[b]) {
        result[b] = {}
      }
      result[b][a] = weights[a][b]
    }
  }
  return result
}
