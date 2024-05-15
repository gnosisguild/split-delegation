import proportionally from './proportionally'

export function merge(
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

export function distribute(
  bag: Record<string, number>,
  value: number
): [string, number][] {
  const keys = Object.keys(bag).sort()
  const weights = keys.map((key) => bag[key])
  const result = proportionally(value, weights)
  return keys.map((key, i) => [key, result[i]])
}
