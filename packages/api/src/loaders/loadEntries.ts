import assert from 'assert'
import aggregateRpc from './aggregateRpc'

import { Address, Block, PublicClient } from 'viem'

const PARALLELISM = 15

export default async function ({
  contracts,
  fromBlock,
  toBlock,
  client,
}: {
  contracts: Address[]
  fromBlock: number
  toBlock: number
  client: PublicClient
}) {
  const logs = await aggregateRpc(
    { fromBlock, toBlock },
    async (fromBlock, toBlock) =>
      client.getLogs({
        address: contracts,
        fromBlock: BigInt(fromBlock),
        toBlock: BigInt(toBlock),
      })
  )

  const blocks = new Map<bigint, Block>()
  let todo = Array.from(new Set(logs.map((log) => log.blockNumber)))

  while (todo.length) {
    const result = await Promise.all(
      todo
        .slice(0, PARALLELISM)
        .map((blockNumber) => client.getBlock({ blockNumber }))
    )
    for (const block of result) {
      blocks.set(block.number, block)
    }
    todo = todo.slice(PARALLELISM)
  }

  const chainId = client.chain?.id
  assert(typeof chainId == 'number')

  return logs.map((log) => ({
    chainId,
    block: blocks.get(log.blockNumber) as Block,
    log,
  }))
}
