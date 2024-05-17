import { Chain, keccak256, toBytes } from 'viem'

import { timerEnd, timerStart } from '../fns/timer'
import createDelegationGraph from '../fns/delegations/createDelegationGraph'
import delegateStats, {
  DelegateStats,
  top,
} from '../calculations/delegateStats'
import kahn from '../fns/graph/sort'
import loadScores from './loadScores'
import loadWeights from './loadWeights'

import prisma from '../../prisma/singleton'

export default async function ({
  chain,
  blockNumber,
  space,
  strategies,
  totalSupply,
}: {
  chain: Chain
  blockNumber: number
  space: string
  strategies: any[]
  totalSupply: number
}): Promise<DelegateStats[]> {
  const start = timerStart()
  const result = await cacheGetOrCalculate({
    chain,
    blockNumber,
    space,
    strategies,
    totalSupply,
  })
  console.log(`[TopDelegates] ${space}, done in ${timerEnd(start)}ms`)

  return result
}

async function cacheGetOrCalculate({
  chain,
  blockNumber,
  space,
  strategies,
  totalSupply,
}: {
  chain: Chain
  blockNumber: number
  space: string
  strategies: any[]
  totalSupply: number
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

  const order = kahn(weights)

  const { scores } = await loadScores({
    chain,
    blockNumber,
    space,
    strategies,
    addresses: order,
  })

  const result = top(
    delegateStats({
      weights,
      delegations: createDelegationGraph({ weights }),
      scores,
      totalSupply,
    })
  )

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
        name: 'topDelegates',
        chainId: chain.id,
        blockNumber,
        space,
      })
    )
  )
}

async function cacheGet(key: string): Promise<DelegateStats[] | null> {
  const hit = await prisma.cache.findFirst({ where: { key } })
  if (hit) {
    console.log(`[TopDelegates] Cache Hit ${key.slice(0, 18)}`)
    return JSON.parse(hit.value)
  } else {
    console.log(`[TopDelegates] Cache Miss ${key.slice(0, 18)}`)
    return null
  }
}

async function cachePut(key: string, delegateStats: DelegateStats[]) {
  const value = JSON.stringify(delegateStats)
  await prisma.cache.upsert({
    where: { key },
    create: { key, value },
    update: { key, value },
  })
  console.log(`[TopDelegates] Cache Put ${key.slice(0, 18)}`)
}
