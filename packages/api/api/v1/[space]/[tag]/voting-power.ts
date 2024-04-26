import { Address, BlockTag, getAddress } from 'viem'
import { mainnet } from 'viem/chains'
import type { VercelRequest } from '@vercel/node'

import { syncTip } from 'src/commands/sync'
import blockTagToNumber from 'src/loaders/loadBlockTag'

import createClient from 'src/loaders/createClient'
import loadDelegates from 'src/loaders/loadDelegates'
import loadDelegators from 'src/loaders/loadDelegators'
import loadScores from 'src/loaders/loadScores'

export const GET = async (req: VercelRequest) => {
  const space = req.query.space as string
  const tag = req.query.tag as BlockTag

  const {
    addresses: _addresses,
    options: { strategies, network },
  } = req.body

  // TODO CACHING

  const addresses = _addresses.map((address: any) =>
    getAddress(address)
  ) as Address[]

  const blockNumber = await blockTagToNumber(tag, createClient(mainnet))

  await syncTip(space, blockNumber)

  const { weights: delegatorWeights, scores: delegatorScores } =
    await loadDelegators({
      space,
      strategies,
      network,
      blockNumber,
    })

  const { scores: delegateScores } = await loadDelegates({
    delegatorWeights,
    delegatorScores,
    addresses,
  })

  const scores = await loadScores({
    space,
    strategies,
    network,
    addresses,
    blockNumber,
  })

  const response = Object.fromEntries(
    addresses.map((address) => [
      address,
      (delegateScores[address] || 0) + (scores[address] || 0),
    ])
  )

  return new Response(JSON.stringify(response))
}
