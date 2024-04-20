import createDelegateDAG from 'src/delegate-dag'
import { DelegationAction } from 'src/types'

export default function top(
  actions: DelegationAction[],
  when: number,
  {
    limit,
    offset,
  }: {
    orderBy: 'count' | 'weight'
    limit: number
    offset: number
  }
) {
  const delegateDAG = createDelegateDAG(actions, when)

  return Object.keys(delegateDAG)
    .map((address) => ({
      address,
      delegatorCount: Object.keys(delegateDAG[address]).length,
    }))
    .sort((a, b) => (a.delegatorCount > b.delegatorCount ? -1 : 1))
    .slice(offset, offset + limit)
}
