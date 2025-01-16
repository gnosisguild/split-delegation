import { BlockTag, Chain } from 'viem'
import { gnosis, mainnet } from 'viem/chains'

import loadBlock from './loadBlock'
import loadPin from './loadPin'

export default async function resolveBlockTag(
  blockTag: BlockTag | number | 'pin',
  networkish: any
): Promise<{ chain: Chain; blockNumber: number }> {
  const chain = networkToChain(networkish)

  return {
    chain,
    ...(blockTag == 'pin'
      ? await loadPin(chain)
      : await loadBlock(chain, blockTag)),
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
