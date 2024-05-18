export default function distribute(
  bag: Record<string, number>,
  value: number
): Record<string, number> {
  const total = sum(Object.values(bag))

  const result = Object.entries(bag).map(([address, weight]) => [
    address,
    (weight * value) / total,
  ]) as [string, number][]

  const head = result.slice(0, -1)
  const rest = [
    result[result.length - 1][0],
    value - sum(head.map(([, v]) => v)),
  ] as [string, number]

  return Object.fromEntries([...head, rest])
}

function sum(values: number[]): number {
  return values.reduce((p, n) => p + n, 0)
}
