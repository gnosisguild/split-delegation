import { Block, Chain, keccak256, toBytes } from 'viem'
import loadCandidate from './loadCandidate'

import prisma from '../../prisma/singleton'

export default async function loadPin(
  chain: Chain
): Promise<{ blockNumber: number }> {
  const key = cacheKey({ chain })
  const { blockNumber, blockTimestamp } = await cacheGet(key)
  if (blockAge(blockTimestamp) < 60 * 1000 * 15) {
    console.log(`[Load Pin] Using block ${blockNumber} @ ${chain.name}`)
    return { blockNumber }
  }

  console.log(`[Load Pin] Outdated ${blockNumber} @ ${chain.name}`)

  const block = await loadCandidate(chain)
  await cachePut(key, {
    chainId: chain.id,
    blockNumber: Number(block.number),
    blockTimestamp: Number(block.timestamp),
  })
  console.log(`[Load Pin] New block ${blockNumber} @ ${chain.name}`)

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
        v: '2',
        chainId: chain.id,
      })
    )
  )
}

async function cacheGet(
  key: string
): Promise<{ chainId: number; blockNumber: number; blockTimestamp: number }> {
  const hit = await prisma.cache.findFirst({ where: { key } })
  if (hit) {
    return JSON.parse(hit.value)
  } else {
    return { chainId: 0, blockNumber: 0, blockTimestamp: 0 }
  }
}

async function cachePut(
  key: string,
  {
    chainId,
    blockNumber,
    blockTimestamp,
  }: { chainId: number; blockNumber: number; blockTimestamp: number }
) {
  const value = JSON.stringify({ chainId, blockNumber, blockTimestamp })
  await prisma.cache.upsert({
    where: { key },
    create: { key, value },
    update: { key, value },
  })
}

function blockAge(blockTimestamp: number) {
  const now = Math.floor(Date.now())
  return Math.abs(now - blockTimestamp * 1000)
}
