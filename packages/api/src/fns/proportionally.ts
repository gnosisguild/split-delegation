export default function proportionally(
  bag: Record<string, number>,
  value: number
): [string, number][] {
  const entries = Object.entries(bag)
  const total = entries.reduce((result, [, weight]) => result + weight, 0)
  return entries.map(
    ([address, weight]) =>
      [address, (weight * value) / total] as [string, number]
  )
}
