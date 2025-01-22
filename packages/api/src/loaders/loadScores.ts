import assert from 'assert'
import { Chain, keccak256, toBytes } from 'viem'

import { timerEnd, timerStart } from '../fns/timer'
import { cacheGet } from './cache'
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
}): Promise<Scores> {
  const start = timerStart()
  const { scores } = await _load({
    chain,
    blockNumber,
    space,
    strategies,
    addresses,
  })
  console.info(`[LoadScores] ${space}, done in ${timerEnd(start)}ms`)

  assert(addresses.length <= Object.keys(scores).length)
  return scores
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
    space,
    blockNumber,
    strategies,
  })

  const { scores }: { scores: Scores } = (await cacheGet(key, 'Scores')) || {
    scores: {},
  }

  const missing: string[] = []
  for (const address of addresses) {
    assert(address == address.toLowerCase(), 'not lower case?')
    if (typeof scores[address] != 'number') {
      missing.push(address)
    }
  }

  if (missing.length === 0) {
    return { scores }
  }

  console.info(`[LoadScores] missing ${missing.length} entries`)
  const nextScores = await loadRawScores({
    chain,
    blockNumber,
    space,
    strategies,
    addresses: missing,
  })

  return cachePut(key, chain, blockNumber, space, nextScores)
}

function cacheKey({
  chain,
  space,
  blockNumber,
  strategies,
}: {
  chain: Chain
  space: string
  blockNumber: number
  strategies: any
}) {
  return keccak256(
    toBytes(
      JSON.stringify({
        name: 'loadScores',
        chainId: chain.id,
        space,
        blockNumber,
        strategies,
      })
    )
  )
}

async function cachePut(
  key: string,
  chain: Chain,
  blockNumber: number,
  space: string,
  nextScores: Scores
): Promise<{ scores: Scores }> {
  const entry = await prisma.cache.findUnique({
    where: { key },
  })

  const prevScores: Scores = entry ? JSON.parse(entry.value).scores : {}

  const scores = Object.assign({}, prevScores, nextScores)

  assertScoresFormat(scores)

  const value = JSON.stringify({
    chain: chain.id,
    blockNumber,
    space,
    scores,
  })

  await prisma.cache.upsert({
    where: { key },
    create: { key, value },
    update: { key, value, updatedAt: new Date(Date.now()) },
  })

  console.info(`[LoadScores] Cache Put ${key.slice(0, 18)}`)

  return { scores }
}

function assertScoresFormat(scores: Scores) {
  Object.entries(scores).every(([key, value]) => {
    assert(typeof key == 'string')
    assert(typeof value == 'number')
  })
}
