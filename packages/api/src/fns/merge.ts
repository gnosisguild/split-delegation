export default function merge(
  ...bags: Record<string, number>[]
): Record<string, number> {
  const keys = Array.from(
    new Set(bags.flatMap((bag) => Object.keys(bag)))
  ).sort()

  return Object.fromEntries(
    keys.map((key) => [
      key,
      bags.reduce((result, bag) => result + (bag[key] || 0), 0),
    ])
  )
}
