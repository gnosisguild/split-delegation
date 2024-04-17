import createDelegatorDAG from 'src/graph-delegation/createDelegatorDAG'
import createDelegateDAG from 'src/graph-delegation/createDelegateDAG'

import { DelegationAction } from 'src/types'

export default function top(
  actions: DelegationAction[],
  when: number,
  {
    limit,
    offset,
  }: {
    orderBy: 'count'
    limit: number
    offset: number
  }
) {
  const outDAG = createDelegatorDAG(actions, when)
  const inDAG = createDelegateDAG(outDAG)

  return Object.keys(inDAG)
    .map((address) => ({
      address,
      delegatorCount: Object.keys(inDAG[address]).length,
    }))
    .sort((a, b) => (a.delegatorCount > b.delegatorCount ? -1 : 1))
    .slice(offset, offset + limit)
}
