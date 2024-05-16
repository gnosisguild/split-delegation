import { getAddress } from 'viem'
import { mainnet } from 'viem/chains'

import { compare, count } from '../fns/diff'
import { rangeToStints } from '../fns/rangeToStints'
import { timerEnd, timerStart } from '../fns/timer'
import logToRows from '../fns/logs/logToRows'
import prefix from '../fns/prefix'

import createClient from '../loaders/createClient'
import loadEntities from '../loaders/loadEntities'
import loadLogs from '../loaders/loadLogs'

import config from '../../config.json'

const chains = [mainnet]

const contracts = [
  // v1
  getAddress('0x469788fe6e9e9681c6ebf3bf78e7fd26fc015446'),
  // v2
  getAddress('0xde1e8a7e184babd9f0e3af18f40634e9ed6f0905'),
]

export default async function audit() {
  for (const chain of chains) {
    const start = timerStart()
    const client = createClient(chain)

    const fromBlock = config[chain.id].startBlock
    const toBlock = Number(
      (await client.getBlock({ blockTag: 'finalized' })).number
    )

    console.info(
      `${prefix('Audit')} Starting ${chain.name} from ${fromBlock} to ${toBlock}...`
    )

    const stints = rangeToStints(fromBlock, toBlock)
    let found = 0
    for (const { fromBlock, toBlock, perc } of stints) {
      const prev = await loadEntities({ fromBlock, toBlock })
      const next = logToRows(
        await loadLogs({
          contracts,
          fromBlock,
          toBlock,
          skipTimestamp: true,
          client,
        })
      )

      found += count(compare({ prev, next }))
      console.info(`${prefix('Audit')} ${found} problems ${perc}`)
    }

    console.info(
      `${prefix('Audit')} Done, found ${found} problems, ${timerEnd(start)}ms`
    )
  }
}
