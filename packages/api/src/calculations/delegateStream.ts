import { distribute } from '../fns/bag'
import kahn from '../fns/graph/sort'
import bfs from '../fns/graph/bfs'

import { Weights } from '../types'

export default function (
  weights: Weights<bigint>,
  address: string,
  score: number
) {
  const nodes = [address, ...bfs(weights, address)]
  const result = Object.fromEntries(
    nodes.map((node) => [
      node,
      {
        address: node,
        delegatedPower: node == address ? score : 0,
        breakdown: { direct: 0, transient: 0 },
      },
    ])
  )

  const order = [address, ...kahn(weights, nodes)].filter(
    (node) => !!weights[node]
  )

  for (const from of order) {
    for (const [to, value] of distribute(
      weights[from],
      result[from].delegatedPower
    )) {
      const _from = result[from]
      const _to = result[to]

      _from.breakdown.transient += value
      _from.delegatedPower -= value

      _to.breakdown.direct += from == address ? value : 0
      _to.delegatedPower += value
    }
  }

  return Object.entries(result)
    .filter(([k]) => k != address)
    .map(([, v]) => v)
}
