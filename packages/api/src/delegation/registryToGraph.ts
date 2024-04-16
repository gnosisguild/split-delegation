import { Graph } from 'src/graph/types'
import { Registry } from './types'

export default function (registry: Registry, when: number): Graph<bigint> {
  const [graph] = [registry]
    .map((registry) => filterExpired(registry, when))
    .map((registry) => filterOptOuts(registry))
    .map((registry) => toGraph(registry))

  return graph
}

function filterExpired(registry: Registry, now: number): Registry {
  const isExpired = ({ expiration }: { expiration: number }) =>
    expiration != 0 && expiration < now

  return Object.keys(registry).reduce(
    (result, key) => ({
      ...result,
      [key]: {
        ...registry[key],
        delegation: isExpired(registry[key]) ? [] : registry[key].delegation,
      },
    }),
    {}
  )
}

function filterOptOuts(registry: Registry): Registry {
  const optedOut = new Set(
    Object.keys(registry).filter((account) => registry[account].optOut == true)
  )

  if (optedOut.size == 0) {
    return registry
  }

  return Object.keys(registry).reduce((result, key) => {
    return {
      ...result,
      [key]: {
        ...registry[key],
        delegation: registry[key].delegation.filter(
          ({ delegate }) => optedOut.has(delegate) == false
        ),
      },
    }
  }, {})
}

function toGraph(registry: Registry): Graph<bigint> {
  return Object.keys(registry).reduce((result, account) => {
    const { delegation } = registry[account]
    return {
      ...result,
      [account]: delegation.reduce(
        (result, { delegate, ratio }) => ({ ...result, [delegate]: ratio }),
        {}
      ),
    }
  }, {})
}
