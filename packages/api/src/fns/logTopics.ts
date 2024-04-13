import assert from 'assert'
import { isHash, isHex, keccak256, toBytes } from 'viem'

/*
 * event DelegationUpdated(address indexed account, string context, Delegation[] previousDelegation, Delegation[] delegation, uint256 expirationTimestamp);
 */
export const DELEGATION_UPDATED_SIGNATURE = keccak256(
  toBytes(
    'DelegationUpdated(address,string,(bytes32,uint256)[],(bytes32,uint256)[],uint256)'
  )
)

/*
 * event DelegationCleared(address indexed account, string context, Delegation[] delegatesCleared);
 */
export const DELEGATION_CLEARED_SIGNATURE = keccak256(
  toBytes('DelegationCleared(address,string,(bytes32,uint256)[])')
)

/*
 * event ExpirationUpdated(address indexed account, string context, Delegation[] delegation, uint256 expirationTimestamp);
 */
export const EXPIRATION_SIGNATURE = keccak256(
  toBytes('ExpirationUpdated(address,string,(bytes32,uint256)[],uint256)')
)

/*
 * event OptOutStatusSet(address indexed delegate, string context, bool optout);
 */
export const OPT_OUT_SIGNATURE = keccak256(
  toBytes('OptOutStatusSet(address,string,bool)')
)

export function isExpirationUpdated({
  topics,
  data,
}: {
  topics: string[]
  data: string
}) {
  assert(topics.every(isHash))
  assert(isHex(data))

  const [hash] = topics

  return hash == EXPIRATION_SIGNATURE
}

export function isDelegationUpdated({
  topics,
  data,
}: {
  topics: string[]
  data: string
}) {
  assert(topics.every(isHash))
  assert(isHex(data))

  const [hash] = topics

  return hash == DELEGATION_UPDATED_SIGNATURE
}

export function isDelegationCleared({
  topics,
  data,
}: {
  topics: string[]
  data: string
}) {
  assert(topics.every(isHash))
  assert(isHex(data))

  const [hash] = topics
  return hash == DELEGATION_CLEARED_SIGNATURE
}

export function isOptOut({ topics, data }: { topics: string[]; data: string }) {
  assert(topics.every(isHash))
  assert(isHex(data))

  const [hash] = topics
  return hash == OPT_OUT_SIGNATURE
}
