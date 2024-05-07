import { Address, Chain } from 'viem'

import all from '../weights/all'
import compute from '../compute'

import loadWeights from './loadWeights'
import loadScores from './loadScores'

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

  const { votingPower, delegatorCount } = await compute({
    weights,
    scores,
    voters,
  })

  return {
    votingPower,
    delegatorCount,
  }
}
