import assert from 'assert'
import async from 'async'
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

  const blocks = await async.mapLimit(
    Array.from(new Set(logs.map((log) => log.blockNumber))),
    PARALLELISM,
    function (blockNumber, done: (err: any, result: Block) => void) {
      client.getBlock({ blockNumber }).then((block) => done(null, block))
    }
  )

  const chainId = client.chain?.id
  assert(typeof chainId == 'number')

  return logs.map((log) => ({
    chainId,
    blockTimestamp: Number(
      blocks.find((block) => block.number == log.blockNumber)
        ?.timestamp as bigint
    ),
    log,
  }))
}
