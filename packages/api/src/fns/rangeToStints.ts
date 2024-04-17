import assert from 'assert'
import rangeToChunks from './rangeToChunks'

const TARGET_STINT_COUNT = 15
const MIN_STINT_SIZE = 30000
const MAX_STINT_SIZE = 100000

export function rangeToStints(startBlock: number, endBlock: number) {
  assert(startBlock <= endBlock)

  const total = endBlock - startBlock + 1
  const chunkSize = applyMaxMin(total / TARGET_STINT_COUNT)

  const chunks = rangeToChunks(startBlock, endBlock, chunkSize)
  const verbose = chunks.length > 1

  const perc = (i: number) => {
    const percentage = (i / chunks.length) * 100
    return `${Math.round(percentage)}%`
  }

  const result = chunks.map(({ from, to }, index) => ({
    fromBlock: from,
    toBlock: to,
    verbose,
    perc: perc(index + 1),
    count: to - startBlock + 1,
  }))

  const digits = String(result[result.length - 1].count).length

  return result.map((entry) => ({
    ...entry,
    count: String(entry.count).padEnd(digits, ' '),
  }))
}

function applyMaxMin(targetChunKSize: number) {
  return Math.min(
    MAX_STINT_SIZE,
    Math.max(MIN_STINT_SIZE, Math.floor(targetChunKSize))
  )
}
