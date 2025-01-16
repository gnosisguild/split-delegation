import { BlockTag, Chain } from 'viem'
import { gnosis, mainnet } from 'viem/chains'

import loadBlock from './loadBlock'
import loadPin from './loadPin'

export default async function resolveBlockTag(
  blockTagish: any,
  networkish: any
): Promise<{ chain: Chain; blockNumber: number; blockTimestamp: number }> {
  const chain = networkToChain(networkish)

  return {
    chain,
    ...(blockTagish == 'pin'
      ? await loadPin(chain)
      : await loadBlock(chain, toBlockTag(blockTagish))),
  }
}

function networkToChain(networkish: any): Chain {
  const chains = [mainnet, gnosis]
  const chain = chains.find(
    (chain) =>
      networkish == chain.id ||
      networkish == String(chain.id) ||
      networkish == chain.name
  )
  if (!chain) {
    throw new Error('Unkown Network Parameter')
  }
  return chain
}

function toBlockTag(blockTagish: any): BlockTag | number {
  if (typeof blockTagish !== 'string' && typeof blockTagish !== 'number') {
    throw new Error(`Invalid BlockTag "${blockTagish}"`)
  }

  return /^\d+$/.test(String(blockTagish).trim())
    ? Number(blockTagish)
    : (blockTagish as BlockTag)
}
