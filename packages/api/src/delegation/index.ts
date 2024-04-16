import createDelegatorDAG from './createDelegatorDAG'
import createDelegateDAG from './createDelegateDAG'
import { Graph } from 'src/graph/types'
import { DelegationAction } from 'src/types'

export default function (
  actions: DelegationAction[],
  when: number
): Graph<bigint> {
  const delegatorDAG = createDelegatorDAG(actions, when)
  const delegateDAG = createDelegateDAG(delegatorDAG)
  return delegateDAG
}
