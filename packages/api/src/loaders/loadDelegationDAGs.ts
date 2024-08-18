import assert from 'assert'
import { Chain, keccak256, toBytes } from 'viem'

import { timerEnd, timerStart } from '../fns/timer'
import createDelegations from '../fns/delegations/createDelegations'
import createGraph from '../fns/delegations/createDelegationGraph'
import createRegistry from '../fns/delegations/createRegistry'
import inverse from '../fns/graph/inverse'
import rowToAction from '../fns/logs/rowToAction'

import createClient from './createClient'
import loadEvents from './loadEvents'

import { cacheGet, cachePut } from './cache'
import { DelegationDAGs, Graph } from 'src/types'

export default async function loadDelegationDAGs({
  chain,
  blockNumber,
  space,
}: {
  chain: Chain
  blockNumber: number
  space: string
}): Promise<DelegationDAGs> {
  const start = timerStart()
  const delegations = await cacheGetOrCompute({
    chain,
    blockNumber,
    space,
  })

  const forward = delegations
  const reverse = inverse(delegations)

  console.log(`[Weights] ${space}, done in ${timerEnd(start)}ms`)
  return { forward, reverse }
}

async function cacheGetOrCompute({
  chain,
  blockNumber,
  space,
}: {
  chain: Chain
  blockNumber: number
  space: string
}): Promise<Graph<{ expiration: number; weight: number }>> {
  const key = cacheKey({
    chain,
    blockNumber,
    space,
  })

  const hit = await cacheGet(key, 'DelegationGraph')
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
  const delegations = createDelegations(registry, Number(block.timestamp))
  const delegationGraph = createGraph(delegations)

  await cachePut(key, delegationGraph, 'DelegationGraph')

  return delegationGraph
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
