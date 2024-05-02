import { Chain, keccak256, toBytes } from 'viem'

import { timerEnd, timerStart } from '../fns/timer'
import createWeights from '../weights/createWeights'
import parseRows from '../fns/parseRows'

import createClient from './createClient'
import loadEvents from './loadEvents'

import { Weights } from '../types'

import prisma from '../../prisma/singleton'

// Allow BigInt to be serialized to JSON
Object.defineProperty(BigInt.prototype, 'toJSON', {
  get() {
    'use strict'
    return () => String(this)
  },
})

export default async function loadWeights({
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
  const start = timerStart()
  const { weights } = await _load({
    chain,
    blockNumber,
    space,
    strategies,
  })

  console.log(`[Load Weights] ${space}, done in ${timerEnd(start)}ms`)
  return { weights }
}

async function _load({
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
  const key = cacheKey({
    chain,
    blockNumber,
    space,
    strategies,
  })

  const hit = await cacheGet(key)
  if (hit) return hit

  const block = await createClient(chain).getBlock({
    blockNumber: BigInt(blockNumber),
  })
  const events = await loadEvents({
    space,
    blockTimestamp: Number(block.timestamp),
  })
  const weights = createWeights(parseRows(events), Number(block.timestamp))

  await cachePut(key, weights)

  return { weights }
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
        name: 'loadWeights',
        v: '1',
        chainId: chain.id,
        blockNumber,
        space,
        strategies,
      })
    )
  )
}

async function cacheGet(
  key: string
): Promise<{ weights: Weights<bigint> } | null> {
  const hit = await prisma.cache.findFirst({ where: { key } })
  if (hit) {
    console.log(`[Load Weights] Cache Hit ${key}`)
    return JSON.parse(hit.value, revive)
  }
  return null
}

async function cachePut(key: string, weights: Weights<bigint>) {
  const value = JSON.stringify({ weights })
  await prisma.cache.upsert({
    where: { key },
    create: { key, value },
    update: { key, value },
  })
  console.log(`[Load Weights] Cache Put ${key}`)
}

function revive(key: string, value: string) {
  const digits = /^\d+$/
  if (typeof value == 'string' && digits.test(value)) {
    return BigInt(value)
  }
  return value
}
