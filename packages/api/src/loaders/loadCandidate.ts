import { Chain } from 'viem'
import createClient from './createClient'

export default async function (chain: Chain) {
  const client = createClient(chain)
  return client.getBlock({
    blockNumber: (await client.getBlockNumber()) - BigInt(10),
  })
}
