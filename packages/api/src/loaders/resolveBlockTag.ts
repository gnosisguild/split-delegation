import { BlockNotFoundError, Chain } from 'viem'
import { gnosis, mainnet } from 'viem/chains'

import loadBlock from './loadBlock'
import loadPin from './loadPin'

export default async function resolveBlockTag(
  chain: Chain,
  blockTagish: any
): Promise<number | null> {
  try {
    const { blockNumber } =
      blockTagish == 'pin'
        ? await loadPin(chain)
        : await loadBlock(chain, blockTagish)

    return blockNumber
  } catch (e) {
    if (e instanceof BlockNotFoundError) {
      return null
    }
    throw e
  }
}

export function networkToChain(networkish: any): Chain | null {
  const chains = [mainnet, gnosis]
  return (
    chains.find(
      (chain) =>
        networkish == chain.id ||
        networkish == String(chain.id) ||
        networkish == chain.name
    ) || null
  )
}
