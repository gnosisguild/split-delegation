import { PublicClient, getAddress } from 'viem'
import { gnosis, mainnet } from 'viem/chains'
import { DelegationEvent } from '@prisma/client'

import { compare } from '../fns/diff'
import { rangeToStints } from '../fns/rangeToStints'
import { timerEnd, timerStart } from '../fns/timer'
import logToRows from '../decoding/logToRows'
import prefix from '../fns/prefix'

import createClient from '../loaders/createClient'
import loadEntities from '../loaders/loadEntities'
import loadLogs from '../loaders/loadLogs'

import prisma from '../../prisma/singleton'

const chains = [mainnet, gnosis]

const contracts = [
  // v1
  getAddress('0x469788fe6e9e9681c6ebf3bf78e7fd26fc015446'),
  // v2
  getAddress('0xde1e8a7e184babd9f0e3af18f40634e9ed6f0905'),
]

export default async function heal() {
  for (const chain of chains) {
    const start = timerStart()
    const client = createClient(chain)

    const toBlock = Number(
      (await client.getBlock({ blockTag: 'finalized' })).number
    )
    const fromBlock = toBlock - 1000
    console.info(
      `${prefix('Heal')} Starting ${chain.name} from ${fromBlock} to ${toBlock}...`
    )

    const { found, fixed } = await _heal({
      fromBlock,
      toBlock,
      client,
    })

    const summary = found > 0 ? `${found} fixed ${fixed}` : `${found}`
    console.info(
      `${prefix('Heal')} Done, found ${summary} problems, ${timerEnd(start)}ms`
    )
  }
}

async function _heal({
  fromBlock,
  toBlock,
  client,
}: {
  fromBlock: number
  toBlock: number
  client: PublicClient
}) {
  const stints = rangeToStints(fromBlock, toBlock)

  let found = 0
  let fixed = 0
  for (const { fromBlock, toBlock, perc, verbose } of stints) {
    const [prev, next] = await Promise.all([
      loadEntities({ fromBlock, toBlock }),
      logToRows(await loadLogs({ contracts, fromBlock, toBlock, client })),
    ])

    const diff = compare({ prev, next })

    const { found: currFound, fixed: currFixed } = await patch(diff)

    found += currFound
    fixed += currFixed

    if (verbose) {
      console.info(`${prefix('Heal')} ${found} problems ${perc}`)
    }
  }

  return { found, fixed }
}

async function patch(diff: {
  create: DelegationEvent[]
  delete: DelegationEvent[]
}) {
  let found = 0
  let fixed = 0

  for (const entry of diff.delete) {
    found++
    await prisma.delegationEvent.delete({ where: { id: entry.id } })
    console.info(`${prefix('Heal')} delete Row ${entry.id}`)
    fixed++
  }
  for (const entry of diff.create) {
    found++
    await prisma.delegationEvent.upsert({
      where: { id: entry.id },
      create: entry,
      update: entry,
    })
    console.info(`${prefix('Heal')} create Row ${entry.id}`)
    fixed++
  }

  return { found, fixed }
}
