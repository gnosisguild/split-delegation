import assert from 'assert'
import { BlockTag, Chain, keccak256, toBytes } from 'viem'

import { cacheGet, cachePut } from './cache'
import createClient from './createClient'

export default async function loadBlock(
  chain: Chain,
  blockTag: BlockTag | number
): Promise<{ blockNumber: number; blockTimestamp: number }> {
  {
    const entry: { blockNumber: number; blockTimestamp: number } | undefined =
      typeof blockTag === 'string'
        ? undefined
        : await cacheGet(cacheKey({ chain, blockNumber: Number(blockTag) }))

    if (entry) {
      return entry
    }
  }

  console.log(`[LoadBlock] Miss ${blockTag} @ ${chain.name}`)
  const block = await createClient(chain).getBlock({
    ...(typeof blockTag === 'string'
      ? { blockTag }
      : { blockNumber: BigInt(blockTag as number) }),
    includeTransactions: false,
  })

  const key = cacheKey({ chain, blockNumber: Number(block.number) })
  const entry = {
    chainId: chain.id,
    blockNumber: Number(block.number),
    blockTimestamp: Number(block.timestamp),
  }

  await cachePut(key, entry)
  console.log(`[LoadBlock] Put ${Number(block.number)} @ ${chain.name}`)

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
