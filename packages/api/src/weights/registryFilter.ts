import { Registry } from './types'

export function filterExpired(registry: Registry, now: number): Registry {
  // THIS IS SLOW
  // const isExpired = ({ expiration }: { expiration: number }) =>
  //   expiration != 0 && expiration < now
  // return Object.keys(registry).reduce(
  //   (result, key) => ({
  //     ...result,
  //     [key]: {
  //       ...registry[key],
  //       delegation: isExpired(registry[key]) ? [] : registry[key].delegation,
  //     },
  //   }),
  //   {}
  // )

  // THIS IS FASTER
  for (const key of Object.keys(registry)) {
    const entry = registry[key]
    const isExpired = entry.expiration != 0 && entry.expiration < now
    if (isExpired) {
      registry[key].delegation = []
    }
  }
  return registry
}

export function filterOptOuts(registry: Registry): Registry {
  const optedOut = new Set(
    Object.keys(registry).filter((account) => registry[account].optOut == true)
  )

  if (optedOut.size == 0) {
    return registry
  }

  // THIS IS SLOW
  // return Object.keys(registry).reduce((result, key) => {
  //   return {
  //     ...result,
  //     [key]: {
  //       ...registry[key],
  //       delegation: registry[key].delegation.filter(
  //         ({ delegate }) => optedOut.has(delegate) == false
  //       ),
  //     },
  //   }
  // }, {})
  // THIS IS FASTER
  for (const key of Object.keys(registry)) {
    const entry = registry[key]

    entry.delegation = entry.delegation.filter(
      ({ delegate }) => optedOut.has(delegate) == false
    )
  }
  return registry
}
