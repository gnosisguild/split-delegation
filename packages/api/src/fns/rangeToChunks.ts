import assert from 'assert'

type Result = { from: number; to: number }

export default function rangeToChunks(
  from: number,
  to: number,
  chunkSize: number
): Result[] {
  assert(from <= to && chunkSize > 0)

  const result: Result[] = []

  for (; from <= to; from += chunkSize) {
    result.push({ from, to: Math.min(to, from + chunkSize - 1) })
  }

  return result
}
