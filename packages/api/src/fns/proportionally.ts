export default function proportionally(
  bag: Record<string, number>,
  value: number
): { to: string; weight: number }[] {
  const entries = Object.entries(bag)
  const total = entries.reduce((result, [, weight]) => result + weight, 0)
  return entries.map(([to, weight]) => ({
    to,
    weight: (weight * value) / total,
  }))
}
