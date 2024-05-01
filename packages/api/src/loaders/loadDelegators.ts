import { Address, keccak256, toBytes } from 'viem'
import { mainnet } from 'viem/chains'

import { merge } from 'src/fns/bag'
import { timerEnd, timerStart } from 'src/fns/timer'
import all from 'src/weights/all'
import createWeights from 'src/weights/createWeights'
import parseRows from 'src/fns/parseRows'

import createClient from './createClient'
import loadEvents from './loadEvents'
import loadScores from './loadScores'

import compute from 'src/compute'

import prisma from '../../prisma/singleton'

// Allow BigInt to be serialized to JSON
Object.defineProperty(BigInt.prototype, 'toJSON', {
  get() {
    'use strict'
    return () => String(this)
  },
})

export default async function loadDelegations({
  space,
  strategies,
  network,
  blockNumber,
  alreadyVoted,
}: {
  space: string
  strategies: any[]
  network: string
  blockNumber: number
  alreadyVoted?: Address[]
}) {
  let start = timerStart()
  const { weights, scores } = await _load({
    space,
    strategies,
    network,
    blockNumber,
  })
  console.log(`Loaded weights for ${space} in ${timerEnd(start)}ms`)

  start = timerStart()
  const { delegatedPower, delegatorCount } = await compute({
    weights,
    scores,
    alreadyVoted,
  })
  console.log(`Computed power for ${space} in ${timerEnd(start)}ms`)

  return {
    delegatedPower,
    delegatorCount,
    scores: alreadyVoted
      ? merge(
          scores,
          await loadScores({
            // TODO we'll make this better soon
            space,
            strategies,
            network,
            blockNumber,
            addresses: alreadyVoted,
          })
        )
      : scores,
  }
}

async function _load({
  space,
  strategies,
  network,
  blockNumber,
}: {
  space: string
  strategies: any[]
  network: string
  blockNumber: number
}) {
  const key = keccak256(
    toBytes(JSON.stringify({ space, strategies, network, blockNumber }))
  )

  const hit = await prisma.cache.findFirst({ where: { key } })
  if (hit) {
    console.log(`Cache Hit: ${key}`)
    return JSON.parse(hit.value, revive)
  }

  const [block, events] = await Promise.all([
    createClient(mainnet).getBlock({
      blockNumber: BigInt(blockNumber),
    }),
    loadEvents({ space, blockNumber }),
  ])

  const weights = createWeights(parseRows(events), Number(block.timestamp))
  const scores = await loadScores({
    space,
    strategies,
    network,
    addresses: all(weights),
    blockNumber,
  })

  const value = JSON.stringify({ weights, scores })
  await prisma.cache.upsert({
    where: { key },
    create: { key, value },
    update: { key, value },
  })
  return { weights, scores }
}

function revive(key: string, value: string) {
  const digits = /^\d+$/
  if (typeof value == 'string' && digits.test(value)) {
    return BigInt(value)
  }
  return value
}
