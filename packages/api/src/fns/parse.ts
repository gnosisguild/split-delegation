import assert from 'assert'
import {
  Address,
  Block,
  decodeAbiParameters,
  encodeAbiParameters,
  getAddress,
  Hash,
  Hex,
  keccak256,
  Log,
  pad,
  parseAbiParameters,
  toHex,
} from 'viem'
import { RegistryV2Event } from '@prisma/client'

import {
  isDelegationCleared,
  isDelegationUpdated,
  isExpirationUpdated,
  isOptOut,
} from './logTopics'
import { DelegationEvent } from '../types'

export default function toRows(
  entries: { chainId: number; block: Block; log: Log }[]
): RegistryV2Event[] {
  return entries.map(({ chainId, block, log }) => {
    const { account, space } = parse(log)
    assert(typeof log.transactionIndex == 'number')
    assert(typeof log.logIndex == 'number')
    return withEventId({
      chainId,
      registry: log.address,
      blockNumber: Number(block.number),
      blockTimestamp: Number(block.timestamp),
      transactionIndex: log.transactionIndex,
      logIndex: log.logIndex,
      space,
      account,
      topics: log.topics,
      data: log.data,
    })
  })
}

export function toEvents(rows: RegistryV2Event[]): DelegationEvent[] {
  return rows.map((row) => {
    const { chainId, registry, space, account } = row

    const base = {
      chainId,
      registry: registry as Address,
      space,
      account: account as Address,
    }

    if (isDelegationUpdated(row)) {
      const { delegation, expiration } = parseDelegationUpdated(row)
      return { ...base, set: { delegation, expiration } }
    }
    if (isDelegationCleared(row)) {
      return { ...base, clear: {} }
    }

    if (isExpirationUpdated(row)) {
      const { expiration } = parseExpirationUpdated(row)
      return { ...base, expire: { expiration } }
    }

    const { optOut } = parseOptOut(row)
    return { ...base, opt: { optOut } }
  })
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

export function parseDelegationCleared({
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

export function parseExpirationUpdated({
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

function parse({ topics, data }: { topics: string[]; data: string }) {
  if (isDelegationUpdated({ topics, data })) {
    return parseDelegationUpdated({ topics, data })
  }
  if (isDelegationCleared({ topics, data })) {
    return parseDelegationCleared({ topics, data })
  }
  if (isExpirationUpdated({ topics, data })) {
    return parseExpirationUpdated({ topics, data })
  }
  return parseOptOut({ topics, data })
}

export function withEventId(
  event: Omit<RegistryV2Event, 'id'>
): RegistryV2Event {
  const {
    chainId,
    registry,
    blockNumber,
    blockTimestamp,
    transactionIndex,
    logIndex,
    space,
    account,
    topics,
    data,
  } = event

  const hash = keccak256(
    encodeAbiParameters(
      [
        { type: 'bytes32' },
        { type: 'bytes32' },
        { type: 'bytes32' },
        { type: 'bytes32' },
        { type: 'bytes32' },
        { type: 'bytes32' },
        { type: 'string' },
        { type: 'bytes32' },
        { type: 'bytes32[]' },
        { type: 'bytes' },
      ],
      [
        pad(toHex(BigInt(chainId))),
        pad(registry as Address),
        pad(toHex(blockNumber)),
        pad(toHex(blockTimestamp)),
        pad(toHex(transactionIndex)),
        pad(toHex(logIndex)),
        space,
        pad(account as Address),
        topics as Hash[],
        data as Hex,
      ]
    )
  )
  return {
    ...event,
    id: `${chainId}-${blockNumber}-${registry}--${hash.slice(2, 2 + 16)}`,
  }
}
