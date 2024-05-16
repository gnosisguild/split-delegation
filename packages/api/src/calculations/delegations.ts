import kahn from '../fns/graph/sort'
import proportionally from '../fns/proportionally'

import { Delegations, Weights } from '../types'

export default function calculateDelegations({
  weights,
  order,
}: {
  weights: Weights
  order?: string[]
}) {
  /*
   * Compute order if not provided.
   */
  order = order || kahn(weights)

  const result = Object.fromEntries(
    order.map((address) => [address, { delegators: [], delegates: [] }])
  ) as Delegations

  for (const origin of order) {
    const delegates = cascade(
      weights,
      origin,
      Object.values(weights[origin] || {}).reduce((p, v) => p + v, 0)
    )

    for (const { to, weight } of delegates) {
      setInResult(result[to].delegators, { address: origin, weight })
      setInResult(result[origin].delegates, { address: to, weight })
    }
  }

  return result
}

function cascade(
  weights: Weights,
  from: string,
  weight: number
): { to: string; weight: number }[] {
  if (!weights[from]) {
    return []
  }

  const direct = proportionally(weights[from], weight).map(([to, weight]) => ({
    to,
    weight,
  }))

  return [
    ...direct,
    ...direct.flatMap(({ to, weight }) => cascade(weights, to, weight)),
  ]
}

function setInResult(
  entries: { address: string; weight: number }[],
  { address, weight }: { address: string; weight: number }
) {
  const index = entries.findIndex((entry) => entry.address === address)
  if (index === -1) {
    entries.push({ address, weight })
  } else {
    entries[index].weight += weight
  }
}
