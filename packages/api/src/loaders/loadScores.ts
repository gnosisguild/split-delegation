import { Address, Chain, getAddress, keccak256, toBytes } from 'viem'
import snapshot from '@snapshot-labs/snapshot.js'

import { timerEnd, timerStart } from 'src/fns/timer'
import { merge } from '../fns/bag'

import { Scores } from '../types'

import prisma from '../../prisma/singleton'

export default async function loadScores({
  chain,
  blockNumber,
  space,
  strategies,
  addresses,
}: {
  chain: Chain
  blockNumber: number
  space: string
  strategies: any[]
  addresses: Address[]
}) {
  const start = timerStart()
  const { scores } = await _load({
    chain,
    blockNumber,
    space,
    strategies,
    addresses,
  })
  console.log(`[Load Scores ] ${space}, done in ${timerEnd(start)}ms`)
  return { scores }
}

async function _load({
  chain,
  blockNumber,
  space,
  strategies,
  addresses,
}: {
  chain: Chain
  blockNumber: number
  space: string
  strategies: any[]
  addresses: Address[]
}) {
  const key = cacheKey({
    chain,
    blockNumber,
    space,
    strategies,
  })

  const { scores } = await cacheGet(key)
  const missing = []
  for (const address of addresses) {
    if (typeof scores[address] != 'number') {
      missing.push(address)
    }
  }

  let allScores
  if (missing.length > 0) {
    console.log(`[Load Scores ] missing ${missing.length} entries`)
    allScores = {
      ...scores,
      ...(await _loadScores({
        chain,
        blockNumber,
        space,
        strategies,
        addresses,
      })),
    }
    await cachePut(key, { scores: allScores })
  } else {
    allScores = scores
  }

  return { scores: allScores }
}

function cacheKey({
  chain,
  blockNumber,
  space,
  strategies,
}: {
  chain: Chain
  blockNumber: number
  space: string
  strategies: any[]
}) {
  return keccak256(
    toBytes(
      JSON.stringify({
        name: 'loadScores',
        v: '1',
        chainId: chain.id,
        blockNumber,
        space,
        strategies,
      })
    )
  )
}

async function cacheGet(key: string): Promise<{ scores: Scores }> {
  const hit = await prisma.cache.findFirst({ where: { key } })
  if (hit) {
    console.log(`[Load Scores ] Cache Hit ${key}`)
    return JSON.parse(hit.value)
  }
  return { scores: {} }
}

async function cachePut(key: string, { scores }: { scores: Scores }) {
  const value = JSON.stringify({ scores })
  await prisma.cache.upsert({
    where: { key },
    create: { key, value },
    update: { key, value },
  })
  console.log(`[Load Scores ] Cache Put ${key}`)
}

async function _loadScores({
  chain,
  blockNumber,
  space,
  strategies,
  addresses,
}: {
  chain: Chain
  blockNumber: number
  space: string
  strategies: any[]
  addresses: Address[]
}): Promise<Record<Address, number>> {
  const result = (await snapshot.utils.getScores(
    space,
    strategies,
    String(chain.id),
    addresses,
    blockNumber
  )) as Record<Address, number>[]

  const bag = result.length == 1 ? result[0] : merge(...result)

  return Object.fromEntries(
    addresses.map((address) => [getAddress(address), bag[address] || 0])
  )
}
