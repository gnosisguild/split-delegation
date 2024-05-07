import { Address, Chain } from 'viem'

import { timerEnd, timerStart } from '../fns/timer'
import all from '../weights/all'
import compute from '../compute'
import loadScores from './loadScores'
import loadWeights from './loadWeights'

export default async function loadPower({
  chain,
  blockNumber,
  space,
  strategies,
  voters,
}: {
  chain: Chain
  blockNumber: number
  space: string
  strategies: any[]
  voters?: Address[]
}) {
  const { weights } = await loadWeights({
    chain,
    blockNumber,
    space,
  })

  const addresses = Array.from(new Set([...all(weights), ...(voters ?? [])]))

  const { scores } = await loadScores({
    chain,
    blockNumber,
    space,
    strategies,
    addresses,
  })

  const start = timerStart()
  const { votingPower, delegators } = await compute({
    weights,
    scores,
    voters,
  })
  console.log(`[Compute] ${space}, done in ${timerEnd(start)}ms`)

  return {
    votingPower,
    delegators,
  }
}
