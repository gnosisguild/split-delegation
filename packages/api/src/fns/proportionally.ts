import assert from 'assert'

/**
 * Distributes a value proportionally based on the provided ratios.
 *
 * @param {number[]} weights - The proportions used for distribution.
 * @param {number} value - The input value to distribute.
 * @returns {number[]} The distributed values based on the ratios.
 */

export default function proportionally(
  value: number,
  weights: number[]
): number[] {
  const scale = sum(weights)

  const result = weights
    .map((weight) => (weight * value) / scale)
    // we exclude the last entry, and just make it the remainder
    .slice(0, -1)

  // assert(sum(result) <= value)

  return [...result, value - sum(result)]
}

function sum(values: number[]): number {
  return values.reduce((p, n) => p + n, 0)
}
