import { BlockTag, Chain } from 'viem'
import { gnosis, mainnet } from 'viem/chains'

import createClient from './createClient'
import loadPin from './loadPin'

export default async function loadBlockTag(
  blockTag: BlockTag | number | 'pin',
  networkish: any
): Promise<{ blockNumber: number; chain: Chain }> {
  const chain = networkToChain(networkish)
  if (!isNaN(Number(blockTag))) {
    return { chain, blockNumber: Number(blockTag) }
  }

  if (blockTag == 'pin') {
    return { chain, blockNumber: (await loadPin(chain)).blockNumber }
  }

  const client = createClient(chain)
  const { number } = await client.getBlock({ blockTag: blockTag as BlockTag })
  return { chain, blockNumber: Number(number) }
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
