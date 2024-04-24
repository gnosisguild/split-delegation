import { Registry } from './types'
import { Weights } from 'src/types'

export default function (registry: Registry, when: number): Weights<bigint> {
  const [graph] = [registry]
    .map((registry) => filterExpired(registry, when))
    .map((registry) => filterOptOuts(registry))
    .map((registry) => toGraph(registry))

  return graph
}

function filterExpired(registry: Registry, now: number): Registry {
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

function filterOptOuts(registry: Registry): Registry {
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
    const shouldFilter = entry.delegation.some(({ delegate }) =>
      optedOut.has(delegate)
    )

    if (shouldFilter) {
      entry.delegation = entry.delegation.filter(
        ({ delegate }) => optedOut.has(delegate) == false
      )
    }
  }
  return registry
}

function toGraph(registry: Registry): Weights<bigint> {
  // THIS IS SLOW
  // return Object.keys(registry).reduce((result, account) => {
  //   const { delegation } = registry[account]
  //   return {
  //     ...result,
  //     [account]: delegation.reduce(
  //       (result, { delegate, ratio }) => ({ ...result, [delegate]: ratio }),
  //       {}
  //     ),
  //   }
  // }, {})

  // THIS IS FASTER
  const graph: Weights<bigint> = {}
  for (const key of Object.keys(registry)) {
    graph[key] = {}
    for (const { delegate, ratio } of registry[key].delegation) {
      graph[key][delegate] = ratio
    }
  }
  return graph
}
