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
  alreadyVoted,
}: {
  chain: Chain
  blockNumber: number
  space: string
  strategies: any[]
  alreadyVoted?: Address[]
}) {
  const { weights } = await loadWeights({
    chain,
    blockNumber,
    space,
    strategies,
  })

  // TODO make this faster
  const addresses = Array.from(
    new Set([...all(weights), ...(alreadyVoted ?? [])])
  )

  const { scores } = await loadScores({
    chain,
    blockNumber,
    space,
    strategies,
    addresses,
  })

  const { delegatedPower, delegatorCount } = await compute({
    weights,
    scores,
    alreadyVoted,
  })

  return {
    delegatedPower,
    delegatorCount,
    scores,
  }
}
