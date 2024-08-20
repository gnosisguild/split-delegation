import assert from 'assert'
import { DelegationDAG, DelegationDAGs } from '../types'

export default function extractExpiration({
  delegations,
  delegator,
}: {
  delegations: DelegationDAG
  delegator: string
}): number {
  if (!delegations[delegator]) {
    return 0
  }

  const expirations = new Set(
    Object.values(delegations[delegator]).map(({ expiration }) => expiration)
  )

  // Ensure that all expirations are the same, if there are any. Should never happen
  assert(expirations.size <= 1, 'More than one expiration')

  // Return the single expiration value, if it exists, otherwise return 0
  return expirations.size === 1 ? Array.from(expirations)[0] : 0
}
