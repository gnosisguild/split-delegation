import { Block, Chain, keccak256, toBytes } from 'viem'
import loadCandidate from './loadCandidate'
import { cacheGet, cachePut } from './cache'

export default async function loadPin(
  chain: Chain
): Promise<{ blockNumber: number }> {
  const key = cacheKey({ chain })
  const { blockNumber, blockTimestamp } = (await cacheGet(key)) || {
    blockNumber: 0,
    blockTimestamp: 0,
  }
  if (blockAge(blockTimestamp) < 60 * 1000 * 30 /* 30 minutes */) {
    console.log(`[Pin] Using block ${blockNumber} @ ${chain.name}`)
    return { blockNumber }
  }

  console.log(`[Pin] Outdated ${blockNumber} @ ${chain.name}`)

  const block = await loadCandidate(chain)
  await cachePut(key, {
    chainId: chain.id,
    blockNumber: Number(block.number),
    blockTimestamp: Number(block.timestamp),
  })
  console.log(`[Pin] New block ${blockNumber} @ ${chain.name}`)

  return { blockNumber: Number(block.number) }
}

export async function setPin({ chain, block }: { chain: Chain; block: Block }) {
  const key = cacheKey({ chain })
  await cachePut(key, {
    chainId: chain.id,
    blockNumber: Number(block.number),
    blockTimestamp: Number(block.timestamp),
  })
}

function cacheKey({ chain }: { chain: Chain }) {
  return keccak256(
    toBytes(
      JSON.stringify({
        name: 'pin',
        chainId: chain.id,
      })
    )
  )
}

function blockAge(blockTimestamp: number) {
  const now = Math.floor(Date.now())
  return Math.abs(now - blockTimestamp * 1000)
}
