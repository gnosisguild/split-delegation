import { Chain, keccak256, toBytes } from 'viem'

import { timerEnd, timerStart } from '../fns/timer'
import delegateStats, {
  DelegateStats,
  orderByCount,
  orderByPower,
} from '../fns/delegateStats'
import loadPower from './loadPower'

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
  const delegateStats = await _load({
    chain,
    blockNumber,
    space,
    strategies,
    totalSupply,
  })
  console.log(`[Load Top] ${space}, done in ${timerEnd(start)}ms`)

  return delegateStats
}

async function _load({
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

  const { votingPower, delegators } = await loadPower({
    chain,
    blockNumber,
    space,
    strategies,
  })

  const result = filterRelevant(
    delegateStats({
      votingPower,
      delegators,
      totalSupply,
    })
  )

  await cachePut(key, result)

  return result
}

function filterRelevant(stats: DelegateStats[]) {
  stats = [...stats]

  const byCount = stats.sort(orderByCount).slice(0, 100)
  const byPower = stats.sort(orderByPower).slice(0, 100)

  const done = new Set<string>()
  const result = []

  for (const entry of [...byCount, ...byPower]) {
    if (!done.has(entry.address)) {
      result.push(entry)
    }
    done.add(entry.address)
  }

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
        name: 'loadTopDelegates',
        v: '1',
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
    console.log(`[Load Top] Cache Hit ${key}`)
    return JSON.parse(hit.value)
  } else {
    console.log(`[Load Top] Cache Miss ${key}`)
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
  console.log(`[Load Top] Cache Put ${key}`)
}
