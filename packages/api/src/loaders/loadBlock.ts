import assert from 'assert'
import { BlockTag, Chain, keccak256, toBytes } from 'viem'

import { cacheGet, cachePut } from './cache'
import createClient from './createClient'

const LOG_PREFIX = 'LoadBlock'

export default async function loadBlock(
  chain: Chain,
  blockTag: BlockTag | number
): Promise<{ blockNumber: number; blockTimestamp: number }> {
  {
    const entry: { blockNumber: number; blockTimestamp: number } | undefined =
      isBlockNumber(blockTag)
        ? await cacheGet(
            cacheKey({ chain, blockNumber: Number(blockTag) }),
            LOG_PREFIX
          )
        : undefined

    if (entry) {
      return entry
    }
  }

  console.log(`[${LOG_PREFIX}] Miss ${blockTag} @ ${chain.name}`)
  const block = await createClient(chain).getBlock({
    ...(isBlockNumber(blockTag)
      ? { blockNumber: BigInt(blockTag) }
      : { blockTag: blockTag as BlockTag }),
    includeTransactions: false,
  })

  const key = cacheKey({ chain, blockNumber: Number(block.number) })
  const entry = {
    chainId: chain.id,
    blockNumber: Number(block.number),
    blockTimestamp: Number(block.timestamp),
  }

  await cachePut(key, entry, LOG_PREFIX)

  return entry
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
