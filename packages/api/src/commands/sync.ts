import assert from 'assert'
import { Address, BlockTag, Chain, PublicClient, getAddress } from 'viem'
import { gnosis, mainnet } from 'viem/chains'

import { rangeToStints } from '@/src/fns/rangeToStints'
import { timerEnd, timerStart } from '@/src/fns/timer'
import parseLogs from '@/src/fns/parseLogs'

import blockTagToNumber from '@/src/loaders/loadBlockTag'
import createClient from '@/src/loaders/createClient'
import loadEntries from '@/src/loaders/loadEntries'

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
  for (const chain of chains) {
    const start = timerStart()
    const client = createClient(chain)

    const { fromBlock, toBlock } = await blockRange('finalized', chain)

    if (fromBlock < toBlock) {
      console.info(
        `${prefix('Sync')} Starting ${chain.name} from ${fromBlock} to ${toBlock}...`
      )
      const count = await _sync({
        contracts,
        fromBlock: Number(fromBlock),
        toBlock: Number(toBlock),
        client,
      })
      console.info(
        `${prefix('Sync')} Done, wrote ${count} rows, in ${timerEnd(start)}ms`
      )
    } else {
      console.info(`${prefix('Sync')} Already In Sync, in ${timerEnd(start)}ms`)
    }
  }
}

export async function syncTip(blockNumber: number, chain: Chain) {
  assert(chain.id == 1 || chain.id == 100)

  const { inSync, fromBlock, toBlock } = await shouldSync(blockNumber, chain)

  if (inSync) {
    return
  }

  await Promise.all([
    _sync({
      contracts,
      ...(chain.id == 1
        ? { fromBlock, toBlock }
        : await blockRange('finalized', mainnet)),
      client: createClient(mainnet),
    }),
    _sync({
      contracts,
      ...(chain.id == 100
        ? { fromBlock, toBlock }
        : await blockRange('finalized', gnosis)),
      client: createClient(gnosis),
    }),
  ])
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
    const entries = await loadEntries({ contracts, fromBlock, toBlock, client })

    const rows = parseLogs(entries)

    const { count: writeCount } = await prisma.delegationEvent.createMany({
      data: rows,
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

function prefix(venue: 'Sync') {
  function ts() {
    const date = new Date(Date.now())
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0')

    // Format the output to show minutes, seconds, and milliseconds
    return `${hours}:${minutes}:${seconds}.${milliseconds}`
  }

  return `[${ts()} ${venue}]`
}

async function blockRange(
  blockTag: BlockTag,
  chain: Chain
): Promise<{ fromBlock: number; toBlock: number }> {
  const { blockNumber } = await blockTagToNumber(blockTag, chain.id)

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
  blockNumber: number,
  chain: Chain
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
