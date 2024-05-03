import async from 'async'
import { Address, Chain, getAddress, keccak256, toBytes } from 'viem'
import snapshot from '@snapshot-labs/snapshot.js'

import { timerEnd, timerStart } from '../../src/fns/timer'
import { merge } from '../fns/bag'

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
  console.log(`[Load Scores ] ${space}, done in ${timerEnd(start)}ms`)
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
  for (const address of addresses) {
    if (typeof scores[address] != 'number') {
      missing.push(address)
    }
  }

  let allScores
  if (missing.length > 0) {
    console.log(`[Load Scores ] missing ${missing.length} entries`)
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
    console.log(`[Load Scores ] Cache Hit ${key}`)
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
  console.log(`[Load Scores ] Cache Put ${key}`)
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
  const result = (await getScores({
    chain,
    blockNumber,
    space,
    strategies,
    addresses,
  })) as Record<Address, number>[]

  const bag = merge(...result)

  return Object.fromEntries(
    addresses.map((address) => [getAddress(address), bag[address] || 0])
  )
}

const CHUNK_SIZE = 500
// const PARALLELISM = 5

async function getScores({
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
  return (
    await async.mapSeries(
      chunks(addresses, CHUNK_SIZE),
      // PARALLELISM,
      function (
        addresses: string[],
        done: (err: any, result: Record<Address, number>) => void
      ) {
        snapshot.utils
          .getScores(
            space,
            strategies,
            String(chain.id),
            addresses,
            blockNumber
          )
          .then((result) => done(null, result as Record<Address, number>))
      }
    )
  ).flat()
}

function chunks<T>(array: T[], chunkSize: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize))
  }
  return result
}
