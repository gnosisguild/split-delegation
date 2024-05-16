export default function distribute(value: number, weights: number[]): number[] {
  const total = sum(weights)

  const result = weights
    .map((weight) => (weight * value) / total)
    // we exclude the last entry, and just make it the remainder
    .slice(0, -1)

  return [...result, value - sum(result)]
}

function sum(values: number[]): number {
  return values.reduce((p, n) => p + n, 0)
}
