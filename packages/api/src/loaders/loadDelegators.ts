import { Address } from 'viem'
import { mainnet } from 'viem/chains'
import createClient from './createClient'
import loadScores from './loadScores'
import loadEvents from './loadEvents'
import parseRows from 'src/fns/parseRows'
import { createDelegatorWeights } from 'src/weights'

/*
 * Called while syncing the DB
 */

export default async function loadDelegators({
  space,
  strategies,
  network,
  blockNumber,
}: {
  space: string
  strategies: any[]
  network: string
  blockNumber: number
}) {
  // TODO GET CACHE

  const [block, events] = await Promise.all([
    createClient(mainnet).getBlock({
      blockNumber: BigInt(blockNumber),
    }),
    loadEvents({ space, blockNumber }),
  ])

  const weights = createDelegatorWeights(
    parseRows(events),
    Number(block.timestamp)
  )
  const scores = await loadScores({
    space,
    strategies,
    network,
    addresses: Object.keys(weights) as Address[],
    blockNumber,
  })

  // TODO PUT CACHE
  return { weights, scores }
}
