import { Address, Chain } from 'viem'

import { timerEnd, timerStart } from 'src/fns/timer'
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
    strategies,
  })

  const addresses = Array.from(new Set([...all(weights), ...(voters ?? [])]))

  const { scores } = await loadScores({
    chain,
    blockNumber,
    space,
    strategies,
    addresses,
  })

  const { votingPower, delegators } = await compute({
    weights,
    scores,
    voters,
  })

  return {
    votingPower,
    delegators,
  }
}
