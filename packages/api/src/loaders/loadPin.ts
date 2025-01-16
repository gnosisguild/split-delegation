import { Chain, keccak256, toBytes } from 'viem'
import { cacheGet, cachePut } from './cache'
import createClient from './createClient'
import loadBlock from './loadBlock'

export default async function loadPin(
  chain: Chain
): Promise<{ blockNumber: number; blockTimestamp: number }> {
  const key = cacheKey({ chain })
  {
    const { blockNumber, blockTimestamp } = (await cacheGet(key)) || {
      blockNumber: 0,
      blockTimestamp: 0,
    }
    if (blockAgeInMinutes(blockTimestamp) < 15 /* 15 minutes */) {
      console.log(`[Pin] Using block ${blockNumber} @ ${chain.name}`)
      return { blockNumber, blockTimestamp }
    }

    console.log(`[Pin] Outdated ${blockNumber} @ ${chain.name}`)
  }

  {
    const { blockNumber, blockTimestamp } = await loadCandidateBlock(chain)
    await cachePut(key, {
      chainId: chain.id,
      blockNumber,
      blockTimestamp,
    })
    console.log(`[Pin] New block ${blockNumber} @ ${chain.name}`)

    return { blockNumber, blockTimestamp }
  }
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
