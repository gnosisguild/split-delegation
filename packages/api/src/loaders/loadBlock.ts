import assert from 'assert'
import { BlockTag, Chain, keccak256, toBytes } from 'viem'

import { timerEnd, timerStart } from '../fns/timer'

import { cacheGet, cachePut } from './cache'
import createClient from './createClient'

type Result = { blockNumber: number; blockTimestamp: number }

const LOG_PREFIX = 'LoadBlock'

export default async function loadBlock(
  chain: Chain,
  blockTag: BlockTag | number
): Promise<Result> {
  const start = timerStart()

  const { blockNumber, blockTimestamp } = await _load(chain, blockTag)

  console.log(
    `[${LOG_PREFIX}] ${blockNumber} @ ${chain.name}, done in ${timerEnd(start)}ms`
  )
  return { blockNumber, blockTimestamp }
}

async function _load(
  chain: Chain,
  blockTag: BlockTag | number
): Promise<Result> {
  let result = isBlockNumber(blockTag)
    ? await cacheGet(
        cacheKey({ chain, blockNumber: Number(blockTag) }),
        LOG_PREFIX
      )
    : null

  if (!result) {
    const block = await createClient(chain).getBlock({
      ...(isBlockNumber(blockTag)
        ? { blockNumber: BigInt(blockTag) }
        : { blockTag: blockTag as BlockTag }),
      includeTransactions: false,
    })

    result = {
      blockNumber: Number(block.number),
      blockTimestamp: Number(block.timestamp),
    }

    await cachePut(
      cacheKey({ chain, blockNumber: Number(block.number) }),
      { chainId: chain.id, ...result },
      LOG_PREFIX
    )
  }

  return result
}

function cacheKey({
  chain,
  blockNumber,
}: {
  chain: Chain
  blockNumber: number
}) {
  assert(typeof blockNumber == 'number')
  return keccak256(
    toBytes(
      JSON.stringify({
        name: 'loadBlock',
        chainId: chain.id,
        blockNumber,
      })
    )
  )
}

function isBlockNumber(blockTagish: any) {
  return /^\d+$/.test(String(blockTagish).trim())
}
