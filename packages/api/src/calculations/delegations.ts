import { distribute } from '../fns/bag'
import kahn from '../fns/graph/sort'

import { Delegations, Weights } from '../types'

export default function calculateDelegations({
  weights,
  order,
}: {
  weights: Weights<bigint>
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
      Object.values(weights[origin] || {}).reduce((p, v) => p + v, 0n)
    )

    for (const { to, weight } of delegates) {
      setInResult(result[to].delegators, { address: origin, weight })
      setInResult(result[origin].delegates, { address: to, weight })
    }
  }

  return result
}

function cascade(
  weights: Weights<bigint>,
  from: string,
  weight: bigint
): { to: string; weight: bigint }[] {
  if (!weights[from]) {
    return []
  }

  const direct = distribute(weights[from], weight).map(([to, weight]) => ({
    to,
    weight,
  }))

  return [
    ...direct,
    ...direct.flatMap(({ to, weight }) => cascade(weights, to, weight)),
  ]
}

function setInResult(
  entries: { address: string; weight: bigint }[],
  { address, weight }: { address: string; weight: bigint }
) {
  const index = entries.findIndex((entry) => entry.address === address)
  if (index === -1) {
    entries.push({ address, weight })
  } else {
    entries[index].weight += weight
  }
}
