import { Address } from 'viem'
import { mainnet } from 'viem/chains'

import all from 'src/weights/all'
import createClient from './createClient'
import createDelegatorPower from 'src/weights/createDelegatorPower'
import createDelegatorWeights from 'src/weights/createDelegatorWeights'
import loadEvents from './loadEvents'
import loadScores from './loadScores'
import parseRows from 'src/fns/parseRows'

/*
 * Called while syncing the DB
 */

export default async function loadDelegators({
  space,
  strategies,
  network,
  blockNumber,
  alreadyVoted,
}: {
  space: string
  strategies: any[]
  network: string
  blockNumber: number
  alreadyVoted?: Address[]
}) {
  const { weights, scores } = await _load({
    space,
    strategies,
    network,
    blockNumber,
  })

  return {
    delegatorWeights: weights,
    delegatorPower: createDelegatorPower({
      delegatorWeights: weights,
      scores,
      alreadyVoted,
    }),
    scores,
  }
}

async function _load({
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
    addresses: all(weights),
    blockNumber,
  })

  // TODO PUT CACHE
  return { weights, scores }
}
