import { Chain, keccak256, toBytes } from 'viem'

import { timerEnd, timerStart } from '../fns/timer'
import calculateDelegations from '../calculations/delegations'
import loadWeights from '../loaders/loadWeights'
import revive from '../fns/revive'

import { Delegations } from '../types'

import prisma from '../../prisma/singleton'

export default async function ({
  chain,
  blockNumber,
  space,
}: {
  chain: Chain
  blockNumber: number
  space: string
}): Promise<Delegations> {
  const start = timerStart()
  const result = await cacheGetOrCalculate({
    chain,
    blockNumber,
    space,
  })
  console.log(`[Delegations] ${space}, done in ${timerEnd(start)}ms`)

  return result
}

async function cacheGetOrCalculate({
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

  {
    const result = await cacheGet(key)
    if (result) {
      return result
    }
  }

  const { weights } = await loadWeights({
    chain,
    blockNumber,
    space,
  })
  const result = calculateDelegations({ weights })

  await cachePut(key, result)

  return result
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
        name: 'delegations',
        chainId: chain.id,
        blockNumber,
        space,
      })
    )
  )
}

async function cacheGet(key: string): Promise<Delegations | null> {
  const hit = await prisma.cache.findFirst({ where: { key } })
  if (hit) {
    console.log(`[Delegations] Cache Hit ${key.slice(0, 18)}`)
    return JSON.parse(hit.value, revive)
  } else {
    console.log(`[Delegations] Cache Miss ${key.slice(0, 18)}`)
    return null
  }
}

async function cachePut(key: string, delegations: Delegations) {
  const value = JSON.stringify(delegations)
  await prisma.cache.upsert({
    where: { key },
    create: { key, value },
    update: { key, value },
  })
  console.log(`[Delegations] Cache Put ${key.slice(0, 18)}`)
}
