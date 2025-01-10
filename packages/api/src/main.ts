import { getAddress } from 'viem'
import { DataHandlerContext, EvmBatchProcessor } from '@subsquid/evm-processor'

import { DatabaseStore } from '../prisma/store'

import { mainnet, gnosis } from './chains'
import { ChainConfig } from './chains/types'
import { blockDataToRows } from './fns/logs/logToRows'

import prisma from '../prisma/singleton'

const V1_ADDRESS = getAddress('0x469788fe6e9e9681c6ebf3bf78e7fd26fc015446')
const V2_ADDRESS = getAddress('0xde1e8a7e184babd9f0e3af18f40634e9ed6f0905')

type Context = DataHandlerContext<any, Record<string, never>>

async function run() {
  const logV1 = (chain: ChainConfig) => ({
    address: [V1_ADDRESS],
    transaction: true,
    range: {
      from: chain.deploymentBlocks.DelegateRegistryV1,
    },
  })

  const logV2 = (chain: ChainConfig) => ({
    address: [V2_ADDRESS],
    transaction: true,
    range: {
      from: chain.deploymentBlocks.DelegateRegistryV2,
    },
  })

  for (const chain of [mainnet, gnosis]) {
    console.log(`Starting processor for ${chain.shortName}`)

    const processor = new EvmBatchProcessor()
      .setGateway(chain.gateway)
      // .setRpcEndpoint(chain.rpc)
      .addLog(logV1(chain))
      .addLog(logV2(chain))
    // .setFinalityConfirmation(chain.finality)

    processor.run(new DatabaseStore(chain.chainId), async (ctx: Context) => {
      const rows = blockDataToRows(chain.chainId, ctx.blocks)

      await prisma.delegationEvent.createMany({
        data: rows,
        skipDuplicates: true,
      })
    })
  }
}

run()
