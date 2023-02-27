// To be used by Vercel Edge Functions
import { get } from "@vercel/edge-config"
import * as R from "ramda"
import {
  DelegateToDelegatorToVoteWeight,
  DelegateToVoteWeight,
} from "../../../types"

export const spaceNameToKey = (snapshotSpace: string) =>
  snapshotSpace.replace(/[^\w]/g, "_")

/**
 * Returns the delegated vote weight for the given addresses.
 *
 * Only addresses with vote weight are returned.
 *
 * @param snapshotSpace - Name of the Snapshot space
 * @param addresses - Addresses to get the delegated vote weight for
 * @returns a map of address to delegated vote weight (addresses with no delegated vote weight are not returned)
 */
export const getDelegatedVoteWeight = async (
  snapshotSpace: string,
  addresses: string[],
) => {
  const voteWeights = await get<{
    [delegate: string]: number
  }>(`${spaceNameToKey(snapshotSpace)}-delegatedVoteWeight`)
  return R.pick(addresses, voteWeights) ?? {}
}

/**
 * Get the top delegates by vote weight for a given Snapshot space.
 *
 * @param snapshotSpace - Name of the Snapshot space
 * @param numberOfDelegatesToReturn - Number of delegates to return (default: 100)
 * @returns A list of tuples of delegate address and vote weight
 */
export const getTopDelegatesByVoteWeight = async (
  snapshotSpace: string,
  numberOfDelegatesToReturn: number = 100,
) => {
  const voteWeights =
    (await get<DelegateToVoteWeight>(
      `${spaceNameToKey(snapshotSpace)}-delegatedVoteWeight`,
    )) ?? {}

  const pairs = R.toPairs<number>(voteWeights)
  const sortedPairs = R.reverse(R.sortBy<[string, number]>(R.prop(1), pairs))

  return R.take(numberOfDelegatesToReturn, sortedPairs)
}

/**
 * Get the top delegators for a given delegate.
 *
 * @param snapshotSpace - Name of the Snapshot space
 * @param delegateAddress - Address of the delegate
 * @param numberOfDelegatorsToReturn - Number of delegators to return (default: 100)
 * @returns A list of tuples of delegator address and vote weight
 */
export const getTopDelegatorsForDelegate = async (
  snapshotSpace: string,
  delegateAddress: string,
  numberOfDelegatorsToReturn: number = 100,
) => {
  const delegators =
    (await get<DelegateToDelegatorToVoteWeight>(
      `${spaceNameToKey(snapshotSpace)}-delegatedVoteWeightByAccount`,
    )) ?? {}
  const pairs = R.toPairs<number>(delegators[delegateAddress])
  const sortedPairs = R.reverse(R.sortBy<[string, number]>(R.prop(1), pairs))

  return R.take(numberOfDelegatorsToReturn, sortedPairs)
}

/**
 * Get the number of delegators for a given delegate.
 *
 * @param snapshotSpace - Name of the Snapshot space
 * @param delegateAddress - Address of the delegate
 * @returns The number of delegators for the given delegate
 */
export const getNumberOfDelegatorsForDelegate = async (
  snapshotSpace: string,
  delegateAddress: string,
) => {
  const delegators =
    (await get<DelegateToDelegatorToVoteWeight>(
      `${spaceNameToKey(snapshotSpace)}-delegatedVoteWeightByAccount`,
    )) ?? {}

  return R.keys(delegators[delegateAddress] ?? {}).length
}

/**
 * Get the last update time for the delegated vote weight data.
 *
 * @param snapshotSpace - Name of the Snapshot space
 * @returns The last update time for the delegated vote weight in seconds since the Unix epoch
 */
export const getLastUpdateTime = async (snapshotSpace: string) => {
  return get<number>(`${spaceNameToKey(snapshotSpace)}-updateTime`)
}
