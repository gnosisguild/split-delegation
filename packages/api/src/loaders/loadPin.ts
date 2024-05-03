import { Chain, keccak256, toBytes } from 'viem'

import createClient from './createClient'

import prisma from '../../prisma/singleton'

export default async function loadPin(
  chain: Chain
): Promise<{ blockNumber: number }> {
  const key = cacheKey({ chain })

  const { blockNumber, blockTimestamp } = await cacheGet(key)
  if (blockTimestamp > pinTimestamp()) {
    console.log(`[Load Pin] Using block ${blockNumber} @ ${chain.name}`)
    return { blockNumber }
  }

  const block = await createClient(chain).getBlock({ blockTag: 'latest' })
  await cachePut(key, {
    blockNumber: Number(block.number),
    blockTimestamp: Number(block.timestamp),
  })
  console.log(`[Load Pin] New block ${blockNumber} @ ${chain.name}`)

  return { blockNumber: Number(block.number) }
}

function cacheKey({ chain }: { chain: Chain }) {
  return keccak256(
    toBytes(
      JSON.stringify({
        name: 'pin',
        v: '1',
        chainId: chain.id,
      })
    )
  )
}

async function cacheGet(
  key: string
): Promise<{ blockNumber: number; blockTimestamp: number }> {
  const hit = await prisma.cache.findFirst({ where: { key } })
  if (hit) {
    return JSON.parse(hit.value)
  } else {
    return { blockNumber: 0, blockTimestamp: 0 }
  }
}

async function cachePut(
  key: string,
  {
    blockNumber,
    blockTimestamp,
  }: { blockNumber: number; blockTimestamp: number }
) {
  const value = JSON.stringify({ blockNumber, blockTimestamp })
  await prisma.cache.upsert({
    where: { key },
    create: { key, value },
    update: { key, value },
  })
}

function pinTimestamp(): number {
  const now = new Date()
  const minutes = now.getMinutes()
  const remainder = minutes % 15

  const start = new Date(now)

  if (remainder !== 0) {
    start.setMinutes(minutes - remainder)
  }

  start.setSeconds(0)
  start.setMilliseconds(0)

  return start.getTime() / 1000
}
