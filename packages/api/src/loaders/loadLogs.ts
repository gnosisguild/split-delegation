import aggregateRpc from './aggregateRpc'

import { Address, PublicClient } from 'viem'

export default async function ({
  contract,
  fromBlock,
  toBlock,
  client,
}: {
  contract: Address
  fromBlock: number
  toBlock: number
  client: PublicClient
}) {
  const logs = await aggregateRpc(
    { fromBlock, toBlock },
    async (fromBlock, toBlock) =>
      client.getLogs({
        address: contract,
        fromBlock: BigInt(fromBlock),
        toBlock: BigInt(toBlock),
      })
  )

  return logs
}
