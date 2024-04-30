import { Address, BlockTag, getAddress } from 'viem'
import type { VercelRequest } from '@vercel/node'

import { sum } from 'src/fns/bag'
import inverse from 'src/weights/inverse'

import loadBlockTag from 'src/loaders/loadBlockTag'
import loadDelegators from 'src/loaders/loadDelegators'
import loadScores from 'src/loaders/loadScores'

import { syncTip } from 'src/commands/sync'

export const GET = async (req: VercelRequest) => {
  const space = req.query.space as string
  const tag = req.query.tag as BlockTag

  const {
    options: { strategies, network },
    addresses: _addresses,
  } = req.body

  const { blockNumber, chain } = await loadBlockTag(tag, network)
  await syncTip(blockNumber, chain)

  const addresses = _addresses.map(getAddress).sort() as Address[]

  const { delegatorPower, scores } = await loadDelegators({
    space,
    strategies,
    network,
    blockNumber,
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
