import { Address, BlockTag, getAddress } from 'viem'
import type { VercelRequest } from '@vercel/node'

import loadBlockTag from '../../../../src/loaders/loadBlockTag'
import loadPower from '../../../../src/loaders/loadPower'

import { syncTip } from '../../../../src/commands/sync'

export const GET = async (req: VercelRequest) => {
  const searchParams = new URL(req.url || '').searchParams
  const space = searchParams.get('space') as string
  const tag = searchParams.get('tag') as BlockTag

  const {
    options: { strategies, network },
    addresses: _addresses,
  } = req.body
  const addresses = _addresses.map(getAddress).sort() as Address[]

  const { blockNumber, chain } = await loadBlockTag(tag, network)
  await syncTip(blockNumber, chain)

  const { votingPower } = await loadPower({
    chain,
    blockNumber,
    space,
    strategies,
    alreadyVoted: addresses,
  })

  const response = Object.fromEntries(
    addresses.map((address) => [address, votingPower[address]])
  )

  return new Response(JSON.stringify(response))
}
