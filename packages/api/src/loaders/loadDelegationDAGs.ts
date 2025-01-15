import assert from 'assert'
import { Chain } from 'viem'

import { timerEnd, timerStart } from '../fns/timer'
import createDelegations from '../fns/delegations/createDelegations'
import createDelegationDAG from '../fns/delegations/createDelegationDAG'
import createRegistry from '../fns/delegations/createRegistry'
import inverse from '../fns/graph/inverse'
import rowToAction from '../fns/logs/rowToAction'

import createClient from './createClient'
import loadEvents from './loadEvents'

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
  const { delegationDAG } = await create({
    chain,
    blockNumber,
    space,
  })

  const forward = delegationDAG
  const reverse = inverse(delegationDAG)

  console.log(`[${LOG_PREFIX}] ${space}, done in ${timerEnd(start)}ms`)
  return { forward, reverse }
}

async function create({
  chain,
  blockNumber,
  space,
}: {
  chain: Chain
  blockNumber: number
  space: string
}): Promise<{ delegationDAG: DelegationDAG }> {
  const block = await createClient(chain).getBlock({
    blockNumber: BigInt(blockNumber),
    includeTransactions: false,
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

  return { delegationDAG }
}
