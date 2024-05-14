import assert from 'assert'
import { Chain, keccak256, toBytes } from 'viem'

import { timerEnd, timerStart } from '../fns/timer'
import loadRawScores from './loadRawScores'

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
  addresses: string[]
}) {
  const start = timerStart()
  const { scores } = await _load({
    chain,
    blockNumber,
    space,
    strategies,
    addresses,
  })
  console.log(`[Load Scores] ${space}, done in ${timerEnd(start)}ms`)

  assert(addresses.length <= Object.keys(scores).length)
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
  addresses: string[]
}) {
  const key = cacheKey({
    chain,
    blockNumber,
    space,
  })

  const { scores } = await cacheGet(key)
  const missing: string[] = []
  for (const address of addresses) {
    if (typeof scores[address] != 'number') {
      missing.push(address)
    }
  }

  let allScores
  if (missing.length > 0) {
    console.log(`[Load Scores] missing ${missing.length} entries`)
    allScores = {
      ...scores,
      ...(await loadRawScores({
        chain,
        blockNumber,
        space,
        strategies,
        addresses: missing,
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
}: {
  chain: Chain
  blockNumber: number
  space: string
}) {
  return keccak256(
    toBytes(
      JSON.stringify({
        name: 'loadScores',
        chainId: chain.id,
        blockNumber,
        space,
      })
    )
  )
}

async function cacheGet(key: string): Promise<{ scores: Scores }> {
  const hit = await prisma.cache.findFirst({ where: { key } })
  if (hit) {
    console.log(`[Load Scores] Cache Hit ${key.slice(0, 18)}`)
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
  console.log(`[Load Scores] Cache Put ${key.slice(0, 18)}`)
}
