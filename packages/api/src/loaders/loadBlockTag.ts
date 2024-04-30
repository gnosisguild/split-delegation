import { BlockTag, Chain } from 'viem'
import { gnosis, mainnet } from 'viem/chains'

import createClient from './createClient'

export default async function loadBlockTag(
  blockTag: BlockTag | number,
  networkish: any
): Promise<{ blockNumber: number; chain: Chain }> {
  const chain = networkToChain(networkish)
  if (!isNaN(Number(blockTag))) {
    return { blockNumber: Number(blockTag), chain }
  }

  const client = createClient(chain)
  const { number } = await client.getBlock({ blockTag: blockTag as BlockTag })
  return { blockNumber: Number(number), chain }
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
