import assert from 'assert'
import {
  Address,
  encodeAbiParameters,
  Hash,
  Hex,
  keccak256,
  Log,
  pad,
  toHex,
} from 'viem'
import { DelegationEvent } from '@prisma/client'

import { decodeLog } from './decodeLog'

export default function logToRow(
  entries: { chainId: number; blockTimestamp: number; log: Log }[]
): DelegationEvent[] {
  return entries.map(({ chainId, blockTimestamp, log }) => {
    const { account, spaceId } = decodeLog(log)
    assert(typeof log.transactionIndex == 'number')
    assert(typeof log.logIndex == 'number')
    return withId({
      chainId,
      registry: log.address,
      blockNumber: Number(log.blockNumber),
      blockTimestamp,
      transactionIndex: log.transactionIndex,
      logIndex: log.logIndex,
      spaceId,
      account,
      topics: log.topics,
      data: log.data,
    })
  })
}

function withId(event: Omit<DelegationEvent, 'id'>): DelegationEvent {
  return {
    ...event,
    id: eventId(event),
  }
}

export function eventId(event: Omit<DelegationEvent, 'id'>): string {
  const {
    chainId,
    registry,
    blockNumber,
    transactionIndex,
    logIndex,
    spaceId,
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
        { type: 'bytes32' },
        { type: 'bytes32[]' },
        { type: 'bytes' },
      ],
      [
        pad(toHex(BigInt(chainId))),
        pad(registry as Address),
        pad(toHex(blockNumber)),
        pad(toHex(transactionIndex)),
        pad(toHex(logIndex)),
        spaceId as Hex,
        pad(account as Address),
        topics as Hash[],
        data as Hex,
      ]
    )
  )
  return `${chainId}-${blockNumber}-${registry}-${hash.slice(2, 2 + 16)}`
}
