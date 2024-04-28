import { Address, BlockTag, getAddress } from 'viem'
import { mainnet } from 'viem/chains'
import type { VercelRequest } from '@vercel/node'

import { sum } from 'src/fns/bag'
import createDelegatorPower from 'src/weights/createDelegatorPower'
import inverse from 'src/weights/inverse'

import { syncTip } from 'src/commands/sync'
import blockTagToNumber from 'src/loaders/loadBlockTag'
import createClient from 'src/loaders/createClient'
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

  const { delegatorWeights, scores } = await loadDelegators({
    space,
    strategies,
    network,
    blockNumber,
  })

  const delegatorPower = createDelegatorPower({
    delegatorWeights,
    scores,
    alreadyVoted: addresses,
  })

  const delegatePower = inverse(delegatorPower)

  const otherScores = await loadScores({
    space,
    strategies,
    network,
    addresses,
    blockNumber,
  })

  const response = Object.fromEntries(
    addresses.map((address) => [
      address,
      sum(delegatePower[address] || {}) +
        (scores[address] || otherScores[address] || 0),
    ])
  )

  return new Response(JSON.stringify(response))
}
