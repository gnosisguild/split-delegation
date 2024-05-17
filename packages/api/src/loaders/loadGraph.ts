import { Chain, keccak256, toBytes } from 'viem'

import { timerEnd, timerStart } from '../fns/timer'
import createClient from './createClient'
import loadEvents from './loadEvents'

import createDelegationGraph from '../fns/delegations/createDelegationGraph'
import createRegistry from '../fns/delegations/createRegistry'
import createWeights from '../fns/delegations/createWeights'
import kahn from '../fns/graph/sort'
import rowToAction from '../fns/logs/rowToAction'
import toAcyclical from '../fns/graph/toAcyclical'

import { DelegationDAG } from '../types'

import prisma from '../../prisma/singleton'

export default async function loadGraph({
  chain,
  blockNumber,
  space,
}: {
  chain: Chain
  blockNumber: number
  space: string
}) {
  const start = timerStart()
  const { delegations, order } = await cacheGetOrCompute({
    chain,
    blockNumber,
    space,
  })

  console.log(`[Graph] ${space}, done in ${timerEnd(start)}ms`)
  return { delegations, order }
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

  const registry = createRegistry(rowToAction(rows))
  const weights = toAcyclical(createWeights(registry, Number(block.timestamp)))
  const order = kahn(weights)
  const delegations = createDelegationGraph({ weights, order })

  await cachePut(key, { delegations, order })

  return { delegations, order }
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
        name: 'loadGraph',
        chainId: chain.id,
        blockNumber,
        space,
      })
    )
  )
}

async function cacheGet(
  key: string
): Promise<{ delegations: DelegationDAG; order: string[] } | null> {
  const hit = await prisma.cache.findFirst({ where: { key } })
  if (hit) {
    console.log(`[Graph] Cache Hit ${key.slice(0, 18)}`)
    return JSON.parse(hit.value)
  }
  return null
}

async function cachePut(
  key: string,
  { delegations, order }: { delegations: DelegationDAG; order: string[] }
) {
  const value = JSON.stringify({ delegations, order })
  await prisma.cache.upsert({
    where: { key },
    create: { key, value },
    update: { key, value },
  })
  console.log(`[Graph] Cache Put ${key.slice(0, 18)}`)
}
