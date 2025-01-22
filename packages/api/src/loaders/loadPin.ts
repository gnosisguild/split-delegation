import { Chain, keccak256, toBytes } from 'viem'

import { timerEnd, timerStart } from '../fns/timer'
import { cacheGet, cachePut } from './cache'
import createClient from './createClient'
import loadBlock from './loadBlock'

type Result = { blockNumber: number; blockTimestamp: number }
const LOG_PREFIX = 'Pin'

export default async function loadPin(chain: Chain): Promise<Result> {
  const start = timerStart()

  const result = await _load(chain)
  console.log(`[${LOG_PREFIX}] done in ${timerEnd(start)}ms`)

  return result
}

async function _load(chain: Chain): Promise<Result> {
  const key = cacheKey({ chain })

  {
    const { blockNumber, blockTimestamp }: Result =
      (await cacheGet(key)) || (await loadCandidateBlock(chain))

    if (blockAgeInMinutes(blockTimestamp) < 15 /* 15 minutes */) {
      console.log(
        `[${LOG_PREFIX}] Reusing Block ${blockNumber} @ ${chain.name}`
      )
      return { blockNumber, blockTimestamp }
    }
  }

  const { blockNumber, blockTimestamp } = await loadCandidateBlock(chain)
  await cachePut(key, {
    chainId: chain.id,
    blockNumber,
    blockTimestamp,
  })
  console.log(`[Pin] New Block ${blockNumber} @ ${chain.name}`)

  return { blockNumber, blockTimestamp }
}

function cacheKey({ chain }: { chain: Chain }) {
  return keccak256(
    toBytes(
      JSON.stringify({
        name: 'pin',
        chainId: chain.id,
      })
    )
  )
}

async function loadCandidateBlock(chain: Chain) {
  const client = createClient(chain)
  const blockNumber = Number(await client.getBlockNumber())
  return loadBlock(chain, blockNumber - 10)
}

function blockAgeInMinutes(blockTimestamp: number) {
  const now = Math.floor(Date.now() / 1000)
  const ageInSeconds = Math.abs(now - blockTimestamp)
  const ageInMinutes = Math.floor(ageInSeconds / 60)
  return ageInMinutes
}
