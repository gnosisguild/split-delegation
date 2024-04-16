import assert from 'assert'

/**
 * Distributes a value proportionally based on the provided ratios.
 *
 * @param {bigint[]} ratios - The ratios used for distribution.
 * @param {bigint} value - The input value to distribute.
 * @returns {bigint[]} The distributed values based on the ratios.
 */
export default function distributeProportionally(
  value: bigint,
  ratios: bigint[]
): bigint[] {
  const scale = sum(ratios)

  const result = ratios
    .map((ratio) => (ratio * value) / scale)
    // we exclude the last entry, and just make it the remainder
    .slice(0, -1)

  assert(sum(result) < value)

  return [...result, value - sum(result)]
}

function sum(values: bigint[]): bigint {
  return values.reduce((p, n) => p + n, BigInt(0))
}
