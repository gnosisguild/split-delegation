import { Chain, PublicClient, getAddress } from 'viem'
import { gnosis, mainnet } from 'viem/chains'

import { compare } from '../fns/diff'
import { rangeToStints } from '../fns/rangeToStints'
import { timerEnd, timerStart } from '../fns/timer'
import logToRows from '../fns/logs/logToRows'
import prefix from '../fns/prefix'

import createClient from '../loaders/createClient'
import loadEntities from '../loaders/loadEntities'
import loadLogs from '../loaders/loadLogs'
import patch from '../loaders/patch'

const contracts = [
  // v1
  getAddress('0x469788fe6e9e9681c6ebf3bf78e7fd26fc015446'),
  // v2
  getAddress('0xde1e8a7e184babd9f0e3af18f40634e9ed6f0905'),
]

export default async function heal({
  lookback = 1000,
  chains = [mainnet, gnosis],
}: {
  lookback?: number
  chains?: Chain[]
}) {
  const start = timerStart()
  console.info(`${prefix('Heal')} Starting...`)

  let allFound = 0
  let allFixed = 0
  for (const chain of chains) {
    const client = createClient(chain)

    const toBlock = Number(
      (await client.getBlock({ blockTag: 'finalized' })).number
    )

    const { found, fixed } = await _heal({
      fromBlock: toBlock - lookback,
      toBlock,
      client,
    })
    allFound += found
    allFixed += fixed
  }
  const summary = allFound > 0 ? `${allFound} fixed ${allFixed}` : `${allFound}`
  console.info(
    `${prefix('Heal')} Done, found ${summary} problems, ${timerEnd(start)}ms`
  )
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
