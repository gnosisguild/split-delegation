import { BlockTag, getAddress } from 'viem'
import type { VercelRequest } from '@vercel/node'

import delegateStats from '../../../../../src/fns/delegateStats'

import loadBlockTag from '../../../../../src/loaders/loadBlockTag'
import loadPower from '../../../../../src/loaders/loadPower'

import { syncTip } from '../../../../../src/commands/sync'

export const GET = async (req: VercelRequest) => {
  const searchParams = new URL(req.url || '').searchParams
  const space = searchParams.get('space') as string
  const tag = searchParams.get('tag') as BlockTag
  const address = getAddress(searchParams.get('address') as string)

  const {
    options: { totalSupply, strategies, network },
  } = req.body

  const { blockNumber, chain } = await loadBlockTag(tag, network)

  await syncTip(blockNumber, chain)

  const { votingPower, delegatorCount } = await loadPower({
    chain,
    blockNumber,
    space,
    strategies,
  })

  const [response] = delegateStats({
    address,
    totalSupply,
    votingPower,
    delegatorCount,
  })

  return new Response(JSON.stringify(response))
}
