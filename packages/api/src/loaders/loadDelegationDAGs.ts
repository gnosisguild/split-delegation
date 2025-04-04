import { Chain } from 'viem'

import { timerEnd, timerStart } from '../fns/timer'
import createDelegations from '../fns/delegations/createDelegations'
import createDelegationDAG from '../fns/delegations/createDelegationDAG'
import createRegistry from '../fns/delegations/createRegistry'
import inverse from '../fns/graph/inverse'
import rowToAction from '../fns/logs/rowToAction'

import loadEvents from './loadEvents'
import loadBlock from './loadBlock'

import { DelegationDAG, DelegationDAGs } from '../types'

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

  const { delegationDAG } = await _load({
    chain,
    blockNumber,
    space,
  })

  const forward = delegationDAG
  const reverse = inverse(delegationDAG)

  console.info(`[${LOG_PREFIX}] ${space}, done in ${timerEnd(start)}ms`)
  return { forward, reverse }
}

async function _load({
  chain,
  blockNumber,
  space,
}: {
  chain: Chain
  blockNumber: number
  space: string
}): Promise<{ delegationDAG: DelegationDAG }> {
  const { blockTimestamp } = await loadBlock(chain, blockNumber)
  const rows = await loadEvents({
    space,
    blockTimestamp,
  })

  const registry = createRegistry(rowToAction(rows))
  const delegations = createDelegations(registry, blockTimestamp)
  const delegationDAG = createDelegationDAG(delegations)

  return { delegationDAG }
}
