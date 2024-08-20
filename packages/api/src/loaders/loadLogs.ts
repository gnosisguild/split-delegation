import assert from 'assert'
import { mapLimit } from 'async'
import { Address, Block, PublicClient } from 'viem'

import aggregateRpc from './aggregateRpc'

const PARALLELISM = 5

export default async function loadLogs({
  contracts,
  fromBlock,
  toBlock,
  skipTimestamp = false,
  client,
}: {
  contracts: Address[]
  fromBlock: number
  toBlock: number
  skipTimestamp?: boolean
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

  const blocks =
    skipTimestamp == true
      ? null
      : await mapLimit(
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
    blockTimestamp: blocks
      ? Number(
          blocks.find((block) => block.number == log.blockNumber)!.timestamp
        )
      : 0,
    log,
  }))
}
