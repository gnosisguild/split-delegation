import { Chain, keccak256, toBytes } from 'viem'

import { timerEnd, timerStart } from '../fns/timer'
import createDelegationGraph from '../fns/delegations/createDelegationGraph'
import filterVertices from '../fns/graph/filterVertices'
import kahn from '../fns/graph/sort'

import loadWeights from './loadWeights'

import { DelegationDAG } from '../types'

import prisma from '../../prisma/singleton'

export default async function loadGraph({
  chain,
  blockNumber,
  space,
  voters,
}: {
  chain: Chain
  blockNumber: number
  space: string
  voters?: string[]
}) {
  const hasVoters = voters && voters.length > 0

  const start = timerStart()
  const delegations = await (hasVoters
    ? compute({ chain, blockNumber, space, voters })
    : cacheGetOrCompute({
        chain,
        blockNumber,
        space,
      }))
  console.log(`[Graph] ${space}, done in ${timerEnd(start)}ms`)
  return { delegations }
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
  if (hit) return hit.delegations

  const delegations = await compute({ chain, blockNumber, space })

  await cachePut(key, delegations)

  return delegations
}

async function compute({
  chain,
  blockNumber,
  space,
  voters,
}: {
  chain: Chain
  blockNumber: number
  space: string
  voters?: string[]
}) {
  let { weights, order } = await loadWeights({
    chain,
    blockNumber,
    space,
  })

  if (voters && voters.length > 0) {
    weights = filterVertices(weights, voters)
    order = kahn(weights)
  }

  return createDelegationGraph({ weights, order })
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
): Promise<{ delegations: DelegationDAG } | null> {
  const hit = await prisma.cache.findFirst({ where: { key } })
  if (hit) {
    console.log(`[Graph] Cache Hit ${key.slice(0, 18)}`)
    return JSON.parse(hit.value)
  }
  return null
}

async function cachePut(key: string, delegations: DelegationDAG) {
  const value = JSON.stringify({ delegations })
  await prisma.cache.upsert({
    where: { key },
    create: { key, value },
    update: { key, value },
  })
  console.log(`[Graph] Cache Put ${key.slice(0, 18)}`)
}
