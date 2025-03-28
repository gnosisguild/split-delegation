// returns in milliseconds
export function timerStart(): bigint {
  return (process as any).hrtime.bigint()
}
export function timerEnd(start: bigint): number {
  const end = (process as any).hrtime.bigint()
  return Number((end - start) / BigInt(1e6))
}
