import assert from 'assert'
import { Chain, keccak256, toBytes } from 'viem'

import { timerEnd, timerStart } from '../fns/timer'
import loadRawScores from './loadRawScores'

import { cacheGet, cachePut } from './cache'

import { Scores } from '../types'

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
  console.log(`[Scores] ${space}, done in ${timerEnd(start)}ms`)

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
    blockNumber,
    space,
  })

  const { scores }: { scores: Scores } = (await cacheGet(key, 'Scores')) || {
    scores: {},
  }

  const missing: string[] = []
  for (const address of addresses) {
    if (typeof scores[address] != 'number') {
      missing.push(address)
    }
  }

  let nextScores: Scores = {}
  if (missing.length > 0) {
    console.log(`[Scores] missing ${missing.length} entries`)
    nextScores = {
      ...scores,
      ...(await loadRawScores({
        chain,
        blockNumber,
        space,
        strategies,
        addresses: missing,
      })),
    }
    await cachePut(
      key,
      (value?: string) => {
        const scoresInCache = value ? JSON.parse(value).scores : {}
        return {
          scores: {
            ...scoresInCache,
            ...nextScores,
          },
        }
      },
      'Scores'
    )
  } else {
    nextScores = scores
  }

  return { scores: nextScores }
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
        name: 'loadScores',
        chainId: chain.id,
        blockNumber,
        space,
      })
    )
  )
}
