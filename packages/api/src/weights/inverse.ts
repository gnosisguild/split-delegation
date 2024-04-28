import { Weights } from 'src/types'

export default function inverse<T>(weights: Weights<T>) {
  let result: Weights<T> = {}

  for (const out of Object.keys(weights)) {
    for (const inside of Object.keys(weights[out])) {
      if (!result[inside]) {
        result[inside] = {}
      }
      result[inside][out] = weights[out][inside]
    }
  }
  return result
}
