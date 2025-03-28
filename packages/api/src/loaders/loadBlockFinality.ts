import { Chain, keccak256, toBytes } from 'viem'

import { timerEnd, timerStart } from '../fns/timer'

import { cacheGet, cachePut } from './cache'
import createClient from './createClient'

const LOG_PREFIX = 'LoadBlockFinality'

export default async function loadBlockFinality(
  chain: Chain,
  blockNumber: number
): Promise<boolean> {
  const start = timerStart()

  const result = await _load(chain, blockNumber)

  console.info(
    `[${LOG_PREFIX}] ${blockNumber} @ ${chain.name}, done in ${timerEnd(start)}ms`
  )
  return result
}

async function _load(chain: Chain, queryBlockNumber: number): Promise<boolean> {
  const cached = await cacheGet<{
    blockNumber: number
    blockTimestamp: number
  }>(cacheKey({ chain }))

  if (cached && queryBlockNumber <= cached.blockNumber) {
    return true
  }

  const block = await createClient(chain).getBlock({
    blockTag: 'finalized',
    includeTransactions: false,
  })

  const fresh = {
    blockNumber: Number(block.number),
    blockTimestamp: Number(block.timestamp),
  }
  await cachePut(cacheKey({ chain }), fresh)

  return queryBlockNumber <= fresh.blockNumber
}

function cacheKey({ chain }: { chain: Chain }) {
  return keccak256(
    toBytes(
      JSON.stringify({
        name: 'loadBlockFinality',
        chainId: chain.id,
      })
    )
  )
}
