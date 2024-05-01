// /api/v1/safe.ggtest.eth/latest/delegate/0xcDdcCC9976F7fd5658Ac82AA8b12BAaf334d27f6
import { Address, BlockTag } from 'viem'
import type { VercelRequest } from '@vercel/node'

import delegateStats from '@/src/fns/delegateStats'

import loadBlockTag from '@/src/loaders/loadBlockTag'
import loadDelegators from '@/src/loaders/loadDelegators'

import { syncTip } from '@/src/commands/sync'

export const GET = async (req: VercelRequest) => {
  const space = req.query.space as string
  const tag = req.query.space as BlockTag
  const address = req.query.address as Address

  const {
    options: { totalSupply, strategies, network },
  } = req.body

  const { blockNumber, chain } = await loadBlockTag(tag, network)

  await syncTip(blockNumber, chain)

  const { delegatedPower, delegatorCount, scores } = await loadDelegators({
    space,
    strategies,
    network,
    blockNumber,
  })

  const [response] = delegateStats({
    address,
    totalSupply,
    delegatedPower,
    delegatorCount,
    scores,
  })

  return new Response(JSON.stringify(response))
}
