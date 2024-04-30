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
      bags.reduce((result, bag) => result + bag[key] || 0, 0),
    ])
  )
}

export function distribute<T extends number | bigint>(
  bag: Record<string, bigint>,
  value: T
): [string, T][] {
  const keys = Object.keys(bag).sort()
  const weights = keys.map((key) => bag[key])
  const result = proportionally(value, weights)
  return keys.map((key, i) => [key, result[i]])
}
