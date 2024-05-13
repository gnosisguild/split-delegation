import { distribute } from '../fns/bag'
import kahn from '../fns/graph/sort'

import { Weights } from '../types'

type Result = Record<
  string,
  {
    delegates: { address: string; weight: bigint }[]
    delegators: { address: string; weight: bigint }[]
  }
>

export default function ({
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
  ) as Result

  for (const origin of order) {
    const delegates = findDelegates(
      weights,
      origin,
      origin,
      Object.values(weights[origin] || {}).reduce((p, v) => p + v, 0n)
    )

    for (const { from, to, weight } of delegates) {
      add(result[to].delegators, { address: from, weight })
      add(result[from].delegates, { address: to, weight })
    }
  }

  return result
}

function findDelegates(
  weights: Weights<bigint>,
  origin: string,
  from: string,
  weight: bigint
): { from: string; to: string; weight: bigint }[] {
  if (!weights[from]) {
    return []
  }

  const direct = distribute(weights[from], weight).map(([to, weight]) => ({
    from: origin,
    to,
    weight,
  }))

  return [
    ...direct,
    ...direct.flatMap(({ to, weight }) =>
      findDelegates(weights, origin, to, weight)
    ),
  ]
}

function add(
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
