import assert from 'assert'
import { Chain, keccak256, toBytes } from 'viem'

import { timerEnd, timerStart } from '../fns/timer'
import createDelegations from '../fns/delegations/createDelegations'
import createDelegationDAG from '../fns/delegations/createDelegationDAG'
import createRegistry from '../fns/delegations/createRegistry'
import inverse from '../fns/graph/inverse'
import rowToAction from '../fns/logs/rowToAction'

import createClient from './createClient'
import loadEvents from './loadEvents'

import { cacheGet, cachePut } from './cache'
import { DelegationDAG, DelegationDAGs } from 'src/types'

const LOG_PREFIX = 'DelegationDAGs'

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
  const { delegationDAG } = await cacheGetOrCompute({
    chain,
    blockNumber,
    space: mapMaybeTestSpaceToRealSpace(space),
  })

  const forward = delegationDAG
  const reverse = inverse(delegationDAG)

  console.log(`[${LOG_PREFIX}] ${space}, done in ${timerEnd(start)}ms`)
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
}): Promise<{ delegationDAG: DelegationDAG }> {
  const key = cacheKey({
    chain,
    blockNumber,
    space,
  })

  const hit = await cacheGet(key, LOG_PREFIX)
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
  const delegationDAG = createDelegationDAG(delegations)

  await cachePut(key, { delegationDAG }, LOG_PREFIX)

  return { delegationDAG }
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
        name: 'delegationDAG',
        chainId: chain.id,
        blockNumber,
        space,
      })
    )
  )
}

/*
 * This function maps specific hardcoded test space names to their corresponding real event spaces.
 * It allows configured test cases to be hydrated with actual events from the real spaces.
 * By using this mapping, we can create test configurations that leverage real space data from the delegate registry.
 */
function mapMaybeTestSpaceToRealSpace(maybeTestSpace: string) {
  const spaceId = maybeTestSpace.trim().toLowerCase()

  const spaceMapping: Record<string, string> = {
    'safe.ggtest.eth': 'safe.eth',
    'cow.ggtest.eth': 'cow.eth',
    'cowtesting.eth': 'cow.eth',
  }

  return spaceMapping[spaceId] || maybeTestSpace
}
