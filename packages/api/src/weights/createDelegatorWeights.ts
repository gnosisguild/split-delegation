import registryCreate from './registryCreate'
import registryFilter from './registryFilter'

import { DelegationAction, Weights } from 'src/types'

export default function createDelegatorWeights(
  actions: DelegationAction[],
  when: number
): Weights<bigint> {
  const [weights] = [registryCreate(actions)].map((registry) =>
    registryFilter(registry, when)
  )

  return weights
}
