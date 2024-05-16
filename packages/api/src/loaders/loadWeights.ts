import { Chain, keccak256, toBytes } from 'viem'

import { timerEnd, timerStart } from '../fns/timer'
import createClient from './createClient'
import loadEvents from './loadEvents'

import createRegistry from '../fns/delegations/createRegistry'
import createWeights from '../fns/delegations/createWeights'
import rowToAction from '../fns/logs/rowToAction'
import toAcyclical from '../fns/graph/toAcyclical'

import { Weights } from '../types'

import prisma from '../../prisma/singleton'

export default async function loadWeights({
  chain,
  blockNumber,
  space,
}: {
  chain: Chain
  blockNumber: number
  space: string
}) {
  const start = timerStart()
  const { weights } = await _load({
    chain,
    blockNumber,
    space,
  })

  console.log(`[Load Weights] ${space}, done in ${timerEnd(start)}ms`)
  return { weights }
}

async function _load({
  chain,
  blockNumber,
  space,
}: {
  chain: Chain
  blockNumber: number
  space: string
}) {
  const key = cacheKey({
    chain,
    blockNumber,
    space,
  })

  const hit = await cacheGet(key)
  if (hit) return hit

  const block = await createClient(chain).getBlock({
    blockNumber: BigInt(blockNumber),
  })
  const rows = await loadEvents({
    space,
    blockTimestamp: Number(block.timestamp),
  })
  const registry = createRegistry(rowToAction(rows))
  const weights = toAcyclical(createWeights(registry, Number(block.timestamp)))

  await cachePut(key, weights)

  return { weights }
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
        name: 'loadWeights',
        chainId: chain.id,
        blockNumber,
        space,
      })
    )
  )
}

async function cacheGet(key: string): Promise<{ weights: Weights } | null> {
  const hit = await prisma.cache.findFirst({ where: { key } })
  if (hit) {
    console.log(`[Load Weights] Cache Hit ${key.slice(0, 18)}`)
    return JSON.parse(hit.value)
  }
  return null
}

async function cachePut(key: string, weights: Weights) {
  const value = JSON.stringify({ weights })
  await prisma.cache.upsert({
    where: { key },
    create: { key, value },
    update: { key, value },
  })
  console.log(`[Load Weights] Cache Put ${key.slice(0, 18)}`)
}
