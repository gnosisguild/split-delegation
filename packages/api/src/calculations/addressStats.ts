import assert from 'assert'
import basisPoints from '../fns/basisPoints'
import calculateVotingPower from './votingPower'
import reachable from '../fns/graph/reachable'

import { DelegationDAGs, Scores } from '../types'

export default function addressStats({
  delegations,
  scores,
  totalSupply,
  allDelegatorCount,
  address,
}: {
  delegations: DelegationDAGs
  scores: Scores
  totalSupply: number
  allDelegatorCount: number
  address: string
}) {
  const { votingPower, incomingPower, outgoingPower } = calculateVotingPower({
    delegations,
    scores,
    address,
  })

  const delegatorCount = reachable(delegations.reverse, address).length

  return {
    address,
    expiration: extractExpiration({ delegations, address }),
    votingPower,
    incomingPower,
    outgoingPower,
    percentOfVotingPower: basisPoints(votingPower, totalSupply),
    delegatorCount,
    percentOfDelegators: basisPoints(delegatorCount, allDelegatorCount),
  }
}

function extractExpiration({
  delegations,
  address,
}: {
  delegations: DelegationDAGs
  address: string
}): number {
  if (!delegations.forward[address]) {
    return 0
  }

  const expirations = new Set(
    Object.values(delegations.forward[address]).map(
      ({ expiration }) => expiration
    )
  )

  // Ensure that all expirations are the same, if there are any. Should never happen
  assert(expirations.size <= 1)

  // Return the single expiration value, if it exists, otherwise return 0
  return expirations.size === 1 ? Array.from(expirations)[0] : 0
}
