import { BlockTag, Chain } from 'viem'
import { gnosis, mainnet } from 'viem/chains'

import loadBlock from './loadBlock'
import loadPin from './loadPin'

export default async function resolveBlockTag(
  blockTagish: any,
  networkish: any
): Promise<{ chain: Chain; blockNumber: number }> {
  const chain = networkToChain(networkish)

  if (isBlockNumber(blockTagish)) {
    return { chain, blockNumber: Number(blockTagish) }
  }

  return {
    chain,
    ...(blockTagish == 'pin'
      ? await loadPin(chain)
      : await loadBlock(chain, blockTagish as BlockTag)),
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

function isBlockNumber(blockTagish: any) {
  return /^\d+$/.test(String(blockTagish).trim())
}
