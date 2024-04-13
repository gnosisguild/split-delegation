import assert from 'assert'
import {
  Hash,
  Hex,
  decodeAbiParameters,
  isHash,
  isHex,
  keccak256,
  parseAbiParameters,
  toBytes,
} from 'viem'

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

export function parseDelegationUpdated({
  topics,
  data,
}: {
  topics: string[]
  data: string
}) {
  assert(isDelegationUpdated({ topics, data }))

  const [, accountAsTopic] = topics as Hash[]

  const [account] = decodeAbiParameters([{ type: 'address' }], accountAsTopic)
  const result = decodeAbiParameters(
    parseAbiParameters([
      'string',
      '(address,uint256)[]',
      '(address,uint256)[]',
      'uint256',
    ]),
    data as Hex
  )

  console.log(result)
  return {
    account,
    space: context,
  }
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

export function parseOptOut({
  topics,
  data,
}: {
  topics: string[]
  data: string
}) {
  assert(isOptOut({ topics, data }))

  const [, accountAsTopic] = topics as Hash[]

  const [account] = decodeAbiParameters([{ type: 'address' }], accountAsTopic)
  const [context] = decodeAbiParameters([{ type: 'string' }], data as Hex)
  return {
    account,
    space: context,
  }
}

/**
 * About Topic Filters:
 *
 * - []: Any topics allowed.
 * - [A]: A in the first position (and anything after).
 * - [null, B]: Anything in the first position and B in the second position (and anything after).
 * - [A, B]: A in the first position and B in the second position (and anything after).
 * - [[A, B], [A, B]]: (A or B) in the first position and (A or B) in the second position (and anything after).
 *
 */
