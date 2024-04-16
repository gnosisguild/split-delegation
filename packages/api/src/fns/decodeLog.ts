import assert from 'assert'
import {
  Hash,
  Hex,
  decodeAbiParameters,
  getAddress,
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

export function decodeLog({
  topics,
  data,
}: {
  topics: string[]
  data: string
}) {
  if (isDelegationUpdated({ topics, data })) {
    return decodeDelegationUpdated({ topics, data })
  }
  if (isDelegationCleared({ topics, data })) {
    return decodeDelegationCleared({ topics, data })
  }
  if (isExpirationUpdated({ topics, data })) {
    return decodeExpirationUpdated({ topics, data })
  }
  return decodeOptOut({ topics, data })
}

export function decodeDelegationUpdated({
  topics,
  data,
}: {
  topics: string[]
  data: string
}) {
  assert(isDelegationUpdated({ topics, data }))

  const [, accountAsTopic] = topics as Hash[]

  const [account] = decodeAbiParameters([{ type: 'address' }], accountAsTopic)
  const [context, , delegation, expiration] = decodeAbiParameters(
    parseAbiParameters(
      'string, (address,uint256)[], (address,uint256)[], uint256'
    ),
    data as Hex
  )

  return {
    account,
    space: context,
    delegation: delegation.map(([delegate, ratio]) => ({
      delegate: getAddress(delegate),
      ratio,
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
  assert(isDelegationCleared({ topics, data }))

  const [, accountAsTopic] = topics as Hash[]

  const [account] = decodeAbiParameters([{ type: 'address' }], accountAsTopic)
  const [context] = decodeAbiParameters(
    parseAbiParameters('string, (address,uint256)[]'),
    data as Hex
  )

  return {
    account,
    space: context,
  }
}

export function decodeExpirationUpdated({
  topics,
  data,
}: {
  topics: string[]
  data: string
}) {
  assert(isExpirationUpdated({ topics, data }))

  const [, accountAsTopic] = topics as Hash[]

  const [account] = decodeAbiParameters([{ type: 'address' }], accountAsTopic)
  const [context, , expiration] = decodeAbiParameters(
    parseAbiParameters('string, (address,uint256)[], uint256'),
    data as Hex
  )

  return {
    account,
    space: context,
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
  assert(isOptOut({ topics, data }))

  const [, accountAsTopic] = topics as Hash[]

  const [account] = decodeAbiParameters([{ type: 'address' }], accountAsTopic)
  const [context, optOut] = decodeAbiParameters(
    parseAbiParameters('string, bool'),
    data as Hex
  )

  return {
    account,
    space: context,
    optOut,
  }
}

function capExpiration(expiration: bigint): number {
  return expiration > BigInt(Number.MAX_SAFE_INTEGER)
    ? Number.MAX_SAFE_INTEGER
    : Number(expiration)
}
