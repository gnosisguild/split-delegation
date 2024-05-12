import { distribute } from '../fns/bag'
import kahn from '../fns/graph/sort'
import bfs from '../fns/graph/bfs'

import { Weights } from '../types'

export default function ({
  weights,
  score,
  order,
  fromDelegator,
}: {
  weights: Weights<bigint>
  score: number
  order?: string[]
  fromDelegator: string
}) {
  const result = Object.fromEntries(
    [fromDelegator, ...bfs(weights, fromDelegator)].map((address) => [
      address,
      {
        address,
        direct: false,
        delegatedPower: address == fromDelegator ? score : 0,
      },
    ])
  )

  const isReachable = (node: string) => !!result[node]
  const isDelegator = (node: string) => !!weights[node]

  /*
   * Compute order if not provided.
   */
  order = order || kahn(weights)

  /*
   * Only go over nodes which are reachable and have delegations
   */
  order = order.filter(isReachable).filter(isDelegator)

  for (const from of order) {
    for (const [to, value] of distribute(
      weights[from],
      result[from].delegatedPower
    )) {
      result[from].delegatedPower -= value
      result[to].direct = from == fromDelegator
      result[to].delegatedPower += value
    }
  }

  return Object.entries(result)
    .filter(([k]) => k != fromDelegator)
    .map(([, v]) => v)
}
