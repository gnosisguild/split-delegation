// /api/v1/safe.ggtest.eth/latest/delegate/0xcDdcCC9976F7fd5658Ac82AA8b12BAaf334d27f6
import { Address, BlockTag } from 'viem'
import { mainnet } from 'viem/chains'
import type { VercelRequest } from '@vercel/node'

import delegateStats from 'src/fns/delegateStats'
import inverse from 'src/weights/inverse'

import { syncTip } from 'src/commands/sync'
import blockTagToNumber from 'src/loaders/loadBlockTag'
import createClient from 'src/loaders/createClient'
import loadDelegators from 'src/loaders/loadDelegators'

export const GET = async (req: VercelRequest) => {
  const space = req.query.space as string
  const tag = req.query.space as BlockTag
  const address = req.query.address as Address

  const {
    options: { totalSupply, strategies, network },
  } = req.body

  const blockNumber = await blockTagToNumber(tag, createClient(mainnet))

  await syncTip(space, blockNumber)

  const { delegatorWeights, delegatorPower, scores } = await loadDelegators({
    space,
    strategies,
    network,
    blockNumber,
  })

  const [response] = delegateStats({
    address,
    totalSupply,
    delegateWeights: inverse(delegatorWeights),
    delegatePower: inverse(delegatorPower),
    scores,
  })

  return new Response(JSON.stringify(response))
}
