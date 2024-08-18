import reachable from '../graph/reachable'
import { DelegationDAGs } from '../../types'

export default function inputsFor(
  delegations: DelegationDAGs,
  addresses: string[] | string
): string[] {
  addresses = Array.isArray(addresses) ? addresses : [addresses]

  return Array.from(
    new Set([
      ...addresses,
      ...addresses
        .map((address) => reachable(delegations.reverse, address))
        .flat(),
    ])
  ).sort()
}
