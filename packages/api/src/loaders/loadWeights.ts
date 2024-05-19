import assert from 'assert'
import { Chain, keccak256, toBytes } from 'viem'

import { timerEnd, timerStart } from '../fns/timer'
import createEdges from '../fns/delegations/createEdges'
import createGraph from '../fns/delegations/createGraph'
import createRegistry from '../fns/delegations/createRegistry'
import inverse from '../fns/graph/inverse'
import rowToAction from '../fns/logs/rowToAction'

import createClient from './createClient'
import loadEvents from './loadEvents'

import { Graph } from '../types'

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
  const { weights } = await cacheGetOrCompute({
    chain,
    blockNumber,
    space,
  })
  const rweights = inverse(weights)

  console.log(`[Weights] ${space}, done in ${timerEnd(start)}ms`)
  return { weights, rweights }
}

async function cacheGetOrCompute({
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

  for (let i = 1; i < rows.length; i++) {
    assert(rows[i - 1].blockTimestamp <= rows[i].blockTimestamp)
  }

  const registry = createRegistry(rowToAction(rows))
  const edges = createEdges(registry, Number(block.timestamp))
  const graph = createGraph(edges)

  await cachePut(key, { weights: graph })

  return { weights: graph }
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

async function cacheGet(key: string): Promise<{ weights: Graph } | null> {
  const hit = await prisma.cache.findFirst({ where: { key } })
  if (hit) {
    console.log(`[Weights] Cache Hit ${key.slice(0, 18)}`)
    return JSON.parse(hit.value)
  }
  return null
}

async function cachePut(key: string, { weights }: { weights: Graph }) {
  const value = JSON.stringify({ weights })
  await prisma.cache.upsert({
    where: { key },
    create: { key, value },
    update: { key, value },
  })
  console.log(`[Weights] Cache Put ${key.slice(0, 18)}`)
}
