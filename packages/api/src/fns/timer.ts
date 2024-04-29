import { hrtime } from 'node:process'

// returns in milliseconds
export function timerStart(): bigint {
  return hrtime.bigint()
}
export function timerEnd(start: bigint): number {
  const end = hrtime.bigint()
  return Number((end - start) / BigInt(1e6))
}
