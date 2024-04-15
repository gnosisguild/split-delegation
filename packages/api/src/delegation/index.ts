import { DelegationEvent } from 'src/types'
import createDelegatorDAG from './createDelegatorDAG'
import createDelegateDAG from './createDelegateDAG'
import { Graph } from 'src/graph/types'

export default function (
  events: DelegationEvent[],
  now: number
): Graph<bigint> {
  const delegatorDAG = createDelegatorDAG(events, now)
  const delegateDAG = createDelegateDAG(delegatorDAG)
  return delegateDAG
}
