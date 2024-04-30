import { Address, keccak256, toBytes } from 'viem'
import { mainnet } from 'viem/chains'

import all from 'src/weights/all'
import createClient from './createClient'
import createDelegatorPower from 'src/weights/createDelegatorPower'
import createDelegatorWeights from 'src/weights/createDelegatorWeights'
import loadEvents from './loadEvents'
import loadScores from './loadScores'
import parseRows from 'src/fns/parseRows'

import prisma from '../../prisma/singleton'
import { timerEnd, timerStart } from 'src/fns/timer'

// Allow BigInt to be serialized to JSON
Object.defineProperty(BigInt.prototype, 'toJSON', {
  get() {
    'use strict'
    return () => String(this)
  },
})

export default async function loadDelegators({
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
  const result = {
    delegatorWeights: weights,
    delegatorPower: createDelegatorPower({
      delegatorWeights: weights,
      scores,
      alreadyVoted,
    }),
    scores,
  }
  console.log(`Computed power for ${space} in ${timerEnd(start)}ms`)

  return result
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

  const weights = createDelegatorWeights(
    parseRows(events),
    Number(block.timestamp)
  )
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
