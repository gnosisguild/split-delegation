import reachable from '../graph/reachable'
import { Delegations } from '../../types'

export default function inputsFor(
  input:
    | {
        delegations: Delegations
        addresses: string[]
      }
    | {
        delegations: Delegations
        address: string
      }
): string[] {
  const { delegations } = input
  const addresses = 'addresses' in input ? input.addresses : [input.address]

  return Array.from(
    new Set([
      ...addresses,
      ...addresses
        .map((address) => reachable(delegations.reverse, address))
        .flat(),
    ])
  ).sort()
}
