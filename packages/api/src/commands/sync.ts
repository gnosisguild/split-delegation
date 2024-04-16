import { Address, PublicClient, getAddress } from 'viem'
import { gnosis, mainnet } from 'viem/chains'

import { rangeToStints } from 'src/fns/rangeToStints'
import { timerEnd, timerStart } from 'src/fns/timer'

import loadLogs from 'src/loaders/loadEntries'
import createClient from 'src/loaders/createClient'

import prisma from '../../prisma/singleton'
import config from '../../config.json'
import assert from 'assert'
import parseLogs from 'src/fns/parseLogs'

const networks = [mainnet, gnosis]

const contracts = [
  // v1
  getAddress('0x469788fe6e9e9681c6ebf3bf78e7fd26fc015446'),
  // v2
  getAddress('0xde1e8a7e184babd9f0e3af18f40634e9ed6f0905'),
]

export default async function () {
  for (const network of networks) {
    const start = timerStart()

    const client = createClient(network)
    const fromBlock = BigInt(
      (
        await prisma.delegationEvent.findFirst({
          where: { chainId: network.id },
          orderBy: { blockNumber: 'desc' },
        })
      )?.blockNumber || config[network.id].startBlock
    )

    const toBlock = (await client.getBlock({ blockTag: 'finalized' })).number

    console.info(
      `${prefix('Sync')} Starting ${network.name} from ${fromBlock} to ${toBlock}...`
    )

    assert(typeof fromBlock == 'bigint')

    const count = await _sync({
      contracts,
      fromBlock: Number(fromBlock),
      toBlock: Number(toBlock),
      client,
    })
    console.info(
      `${prefix('Sync')} Done, wrote ${count} rows, in ${timerEnd(start)}ms`
    )
  }
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
  let total = 0
  // let stats = emptyStats
  const stints = rangeToStints(fromBlock, toBlock)

  for (const { fromBlock, toBlock, verbose, count, perc } of stints) {
    const entries = await loadLogs({ contracts, fromBlock, toBlock, client })

    const rows = parseLogs(entries)

    const { count: writeCount } = await prisma.delegationEvent.createMany({
      data: rows,
      skipDuplicates: true,
    })
    total += writeCount

    if (verbose) {
      console.info(
        `${prefix('Sync')} ${count} blocks ${perc} (wrote ${total} rows) `
      )
    }
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
