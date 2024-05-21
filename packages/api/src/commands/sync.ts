import assert from 'assert'
import { Address, BlockTag, Chain, PublicClient, getAddress } from 'viem'
import { gnosis, mainnet } from 'viem/chains'

import { rangeToStints } from '../fns/rangeToStints'
import { timerEnd, timerStart } from '../fns/timer'
import logToRows from '../fns/logs/logToRows'
import prefix from '../fns/prefix'

import createClient from '../loaders/createClient'
import loadLogs from '../loaders/loadLogs'
import resolveBlockTag from '../loaders/resolveBlockTag'

import config from '../../config.json'
import prisma from '../../prisma/singleton'

const chains = [mainnet, gnosis]

const contracts = [
  // v1
  getAddress('0x469788fe6e9e9681c6ebf3bf78e7fd26fc015446'),
  // v2
  getAddress('0xde1e8a7e184babd9f0e3af18f40634e9ed6f0905'),
]

/*
 * Called while syncing the DB
 */
export default async function sync() {
  const start = timerStart()
  console.info(`${prefix('Sync')} Starting...`)

  let count = 0
  for (const chain of chains) {
    const client = createClient(chain)

    const { fromBlock, toBlock } = await blockRange(chain, 'latest')

    if (fromBlock < toBlock) {
      count += await _sync({
        contracts,
        fromBlock: Number(fromBlock),
        toBlock: Number(toBlock),
        client,
      })
    }
  }

  if (count > 0) {
    console.info(
      `${prefix('Sync')} Done, wrote ${count} rows, in ${timerEnd(start)}ms`
    )
  } else {
    console.info(`${prefix('Sync')} Already In Sync, in ${timerEnd(start)}ms`)
  }
}

export async function syncTip(tag: number | BlockTag | 'pin', networkish: any) {
  const { chain, blockNumber } = await resolveBlockTag(tag, networkish)

  assert(chain.id == 1 || chain.id == 100)

  const { inSync, fromBlock, toBlock } = await shouldSync(chain, blockNumber)

  if (inSync) {
    return { chain, blockNumber }
  }

  await Promise.all([
    _sync({
      contracts,
      ...(chain.id == 1
        ? { fromBlock, toBlock }
        : await blockRange(mainnet, 'finalized')),
      client: createClient(mainnet),
    }),
    _sync({
      contracts,
      ...(chain.id == 100
        ? { fromBlock, toBlock }
        : await blockRange(gnosis, 'finalized')),
      client: createClient(gnosis),
    }),
  ])

  return { chain, blockNumber }
}

async function _sync({
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
  const chainId = client.chain?.id as number
  const stints = rangeToStints(fromBlock, toBlock)

  let total = 0
  for (const { fromBlock, toBlock, verbose, count, perc } of stints) {
    const entities = logToRows(
      await loadLogs({ contracts, fromBlock, toBlock, client })
    )

    const { count: writeCount } = await prisma.delegationEvent.createMany({
      data: entities,
      skipDuplicates: true,
    })
    total += writeCount

    if (verbose) {
      console.info(
        `${prefix('Sync')} ${count} blocks ${perc} (wrote ${writeCount} rows) `
      )
    }

    const entry = {
      chainId,
      blockNumber: toBlock,
    }

    await prisma.checkpoint.upsert({
      where: { chainId: client.chain?.id as number },
      create: entry,
      update: entry,
    })
  }
  return total
}

async function blockRange(
  chain: Chain,
  blockTag: BlockTag
): Promise<{ fromBlock: number; toBlock: number }> {
  const { blockNumber } = await resolveBlockTag(blockTag, chain.id)

  const chainId = chain.id
  assert(chainId == 1 || chainId == 100)

  const entry = await prisma.checkpoint.findFirst({
    where: { chainId },
  })

  if (!entry) {
    return {
      fromBlock: config[chainId].startBlock,
      toBlock: blockNumber,
    }
  } else {
    return {
      fromBlock: entry.blockNumber,
      toBlock: Math.max(entry.blockNumber, blockNumber),
    }
  }
}

async function shouldSync(
  chain: Chain,
  blockNumber: number
): Promise<{ inSync: boolean; fromBlock: number; toBlock: number }> {
  const chainId = chain.id
  assert(chainId == 1 || chainId == 100)

  const entry = await prisma.checkpoint.findFirst({
    where: { chainId },
  })

  if (!entry) {
    return {
      inSync: false,
      fromBlock: config[chainId].startBlock,
      toBlock: blockNumber,
    }
  }

  if (entry.blockNumber < blockNumber) {
    return { inSync: false, fromBlock: entry.blockNumber, toBlock: blockNumber }
  }

  return { inSync: true, fromBlock: 0, toBlock: 0 }
}
