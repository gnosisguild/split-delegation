import { Chain, keccak256, toBytes } from 'viem'

import { timerEnd, timerStart } from '../fns/timer'
import createClient from './createClient'
import loadEvents from './loadEvents'

import createRegistry from '../fns/createRegistry'
import createWeights from '../fns/createWeights'
import parseRows from '../fns/parseRows'
import revive from '../fns/revive'
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
  const events = await loadEvents({
    space,
    blockTimestamp: Number(block.timestamp),
  })
  const registry = createRegistry(parseRows(events))
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
        v: '1',
        chainId: chain.id,
        blockNumber,
        space,
      })
    )
  )
}

async function cacheGet(
  key: string
): Promise<{ weights: Weights<bigint> } | null> {
  const hit = await prisma.cache.findFirst({ where: { key } })
  if (hit) {
    console.log(`[Load Weights] Cache Hit ${key.slice(0, 18)}`)
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
  console.log(`[Load Weights] Cache Put ${key.slice(0, 18)}`)
}
