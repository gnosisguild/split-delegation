import {
  Hash,
  Hex,
  decodeAbiParameters,
  getAddress,
  keccak256,
  parseAbiParameters,
  toBytes,
} from 'viem'
import spaceId from '../spaceId'

// V1 events
/*
 * event SetDelegate(address indexed delegator, bytes32 indexed id, address indexed delegate);
 */
export const SET_DELEGATE_SIGNATURE = keccak256(
  toBytes('SetDelegate(address,bytes32,address)')
)
/*
 * event ClearDelegate(address indexed delegator, bytes32 indexed id, address indexed delegate);
 */
export const CLEAR_DELEGATE_SIGNATURE = keccak256(
  toBytes('ClearDelegate(address,bytes32,address)')
)

// V2 events
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

export function isSetDelegate({ topics }: { topics: string[] }) {
  if (topics.length !== 4) {
    return false
  }
  const [hash] = topics
  return hash == SET_DELEGATE_SIGNATURE
}

export function isClearDelegate({ topics }: { topics: string[] }) {
  if (topics.length !== 4) {
    return false
  }
  const [hash] = topics
  return hash == CLEAR_DELEGATE_SIGNATURE
}

export function isExpirationUpdated({ topics }: { topics: string[] }) {
  const [hash] = topics

  return hash == EXPIRATION_SIGNATURE
}

export function isDelegationUpdated({ topics }: { topics: string[] }) {
  const [hash] = topics

  return hash == DELEGATION_UPDATED_SIGNATURE
}

export function isDelegationCleared({ topics }: { topics: string[] }) {
  const [hash] = topics
  return hash == DELEGATION_CLEARED_SIGNATURE
}

export function isOptOut({ topics }: { topics: string[]; data: string }) {
  const [hash] = topics
  return hash == OPT_OUT_SIGNATURE
}

export function decodeLog({
  topics,
  data,
}: {
  topics: string[]
  data: string
}) {
  if (isSetDelegate({ topics }) || isClearDelegate({ topics })) {
    return decodeSetClearDelegate({ topics })
  }

  if (isDelegationUpdated({ topics })) {
    return decodeDelegationUpdated({ topics, data })
  }
  if (isDelegationCleared({ topics })) {
    return decodeDelegationCleared({ topics, data })
  }
  if (isExpirationUpdated({ topics })) {
    return decodeExpirationUpdated({ topics, data })
  }
  return decodeOptOut({ topics, data })
}

export function decodeSetClearDelegate({ topics }: { topics: string[] }) {
  // assert(isSetDelegate({ topics }) || isClearDelegate({ topics }))

  const [, accountAsTopic, spaceId, delegateAsTopic] = topics as Hash[]
  const [account] = decodeAbiParameters([{ type: 'address' }], accountAsTopic)
  const [delegate] = decodeAbiParameters([{ type: 'address' }], delegateAsTopic)

  return {
    spaceId,
    account,
    delegate,
  }
}

export function decodeDelegationUpdated({
  topics,
  data,
}: {
  topics: string[]
  data: string
}) {
  // assert(isDelegationUpdated({ topics }))

  const [, accountAsTopic] = topics as Hash[]

  const [account] = decodeAbiParameters([{ type: 'address' }], accountAsTopic)
  const [space, , delegation, expiration] = decodeAbiParameters(
    parseAbiParameters('string, bytes32, (address,uint256)[], uint256'),
    data as Hex
  )

  return {
    account,
    spaceId: spaceId(space),
    delegation: delegation.map(([delegate, ratio]) => ({
      delegate: getAddress(delegate),
      weight: capRatio(ratio),
    })),
    expiration: capExpiration(expiration),
  }
}

export function decodeDelegationCleared({
  topics,
  data,
}: {
  topics: string[]
  data: string
}) {
  // assert(isDelegationCleared({ topics }))

  const [, accountAsTopic] = topics as Hash[]

  const [account] = decodeAbiParameters([{ type: 'address' }], accountAsTopic)
  const [space] = decodeAbiParameters(
    parseAbiParameters('string, (address,uint256)[]'),
    data as Hex
  )

  return {
    account,
    spaceId: spaceId(space),
  }
}

export function decodeExpirationUpdated({
  topics,
  data,
}: {
  topics: string[]
  data: string
}) {
  // assert(isExpirationUpdated({ topics }))

  const [, accountAsTopic] = topics as Hash[]

  const [account] = decodeAbiParameters([{ type: 'address' }], accountAsTopic)
  const [space, , expiration] = decodeAbiParameters(
    parseAbiParameters('string, (address,uint256)[], uint256'),
    data as Hex
  )

  return {
    account,
    spaceId: spaceId(space),
    expiration: capExpiration(expiration),
  }
}

export function decodeOptOut({
  topics,
  data,
}: {
  topics: string[]
  data: string
}) {
  // assert(isOptOut({ topics, data }))

  const [, accountAsTopic] = topics as Hash[]

  const [account] = decodeAbiParameters([{ type: 'address' }], accountAsTopic)
  const [space, optOut] = decodeAbiParameters(
    parseAbiParameters('string, bool'),
    data as Hex
  )

  return {
    account,
    spaceId: spaceId(space),
    optOut,
  }
}

function capExpiration(expiration: bigint): number {
  return expiration > BigInt(Number.MAX_SAFE_INTEGER) ? 0 : Number(expiration)
}

function capRatio(ratio: bigint): number {
  return ratio > BigInt(Number.MAX_SAFE_INTEGER)
    ? Number.MAX_SAFE_INTEGER
    : Number(ratio)
}
