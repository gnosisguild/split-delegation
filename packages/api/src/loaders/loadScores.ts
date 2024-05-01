import { Address, Chain, getAddress, keccak256, toBytes } from 'viem'
import snapshot from '@snapshot-labs/snapshot.js'

import { merge } from '../fns/bag'

import { Scores } from '../types'

import prisma from '../../prisma/singleton'
import { timerEnd, timerStart } from 'src/fns/timer'

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
  console.log(`Loaded scores for ${space} in ${timerEnd(start)}ms`)
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
  for (const address in addresses) {
    if (typeof scores[address] != 'number') {
      missing.push(address)
    }
  }

  let allScores
  if (missing.length > 0) {
    console.log(`LoadScores: Cache missing ${missing.length} entries`)
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
    console.log(`LoadScores: Cache Hit ${key}`)
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
