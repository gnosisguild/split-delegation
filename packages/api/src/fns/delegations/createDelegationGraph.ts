import kahn from '../graph/sort'
import proportionally from '../proportionally'

import { DelegationDAG, Graph } from '../../types'

export default function createDelegationGraph({
  weights,
  order,
}: {
  weights: Graph
  order?: string[]
}) {
  /*
   * Compute order if not provided.
   */
  order = order || kahn(weights)

  const result = Object.fromEntries(
    order.map((address) => [address, { incoming: [], outgoing: [] }])
  ) as DelegationDAG

  for (const origin of order) {
    const total = Object.values(weights[origin] || {}).reduce(
      (p, v) => p + v,
      0
    )

    for (const { to, weight } of cascade(weights, origin, total)) {
      const direct = typeof weights[origin][to] == 'number'
      setInResult(
        result[to].incoming,
        { address: origin, weight, direct },
        total
      )
      setInResult(
        result[origin].outgoing,
        { address: to, weight, direct },
        total
      )
    }
  }

  return result
}

function cascade(
  weights: Graph,
  from: string,
  weight: number
): { to: string; weight: number }[] {
  if (!weights[from]) {
    return []
  }

  const distribution = proportionally(weights[from], weight)

  return [
    ...distribution,
    ...distribution.flatMap(({ to, weight }) => cascade(weights, to, weight)),
  ]
}

function setInResult(
  entries: {
    address: string
    weight: number
    ratio: number
    direct: boolean
  }[],
  {
    address,
    weight,
    direct,
  }: { address: string; weight: number; direct: boolean },
  total: number
) {
  let entry = entries.find((entry) => entry.address === address)
  if (!entry) {
    entry = { address, direct, weight: 0, ratio: 0 }
    entries.push(entry)
  }

  entry.weight += weight
  entry.ratio = entry.weight / total
}
