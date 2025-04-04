import { getAddress } from 'viem'
import { DataHandlerContext, EvmBatchProcessor } from '@subsquid/evm-processor'

import { prisma, DatabaseStore } from './store'

import { mainnet, gnosis } from './chains'
import { ChainConfig } from './chains/types'

import { blockDataToRows } from './fns/logToRows'

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

  const checkpoints = await prisma.checkpoint.findMany()
  const cpMainnet = checkpoints.find((c) => c.chainId == 1)
  const countMainnet = await prisma.delegationEvent.count({
    where: { chainId: 1 },
  })
  const cpGnosis = checkpoints.find((c) => c.chainId == 100)
  const countGnosis = await prisma.delegationEvent.count({
    where: { chainId: 100 },
  })
  if (cpMainnet) {
    console.log(`[Mainnet] ${countMainnet} logs @ ${cpMainnet.blockNumber} `)
  }
  if (cpGnosis) {
    console.log(`[Gnosis ] ${countGnosis} logs @ ${cpGnosis.blockNumber} `)
  }

  const chains = [mainnet, gnosis]
  for (let i = 0; i < chains.length; i++) {
    const chain = chains[i]
    console.log(`Starting processor for ${chain.shortName}`)

    const processor = new EvmBatchProcessor()
      .setGateway(chain.gateway)
      .setPrometheusPort(3000 + i)
      .setRpcEndpoint(chain.rpc)
      .setFinalityConfirmation(chain.finality)
      .addLog(logV1(chain))
      .addLog(logV2(chain))

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
