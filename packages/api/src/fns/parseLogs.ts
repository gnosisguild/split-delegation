import assert from 'assert'
import {
  Address,
  Block,
  encodeAbiParameters,
  Hash,
  Hex,
  keccak256,
  Log,
  pad,
  toHex,
} from 'viem'
import { RegistryV2Event } from '@prisma/client'

import { decodeLog } from './decodeLog'

export default function parseLogs(
  entries: { chainId: number; block: Block; log: Log }[]
): RegistryV2Event[] {
  return entries.map(({ chainId, block, log }) => {
    const { account, space } = decodeLog(log)
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

function withEventId(event: Omit<RegistryV2Event, 'id'>): RegistryV2Event {
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
