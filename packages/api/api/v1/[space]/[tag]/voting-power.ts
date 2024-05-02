import { Address, BlockTag, getAddress } from 'viem'

import loadBlockTag from '../../../../src/loaders/loadBlockTag'
import loadPower from '../../../../src/loaders/loadPower'

import { syncTip } from '../../../../src/commands/sync'
import { VotingPowerRequestBody } from 'src/types'

export const POST = async (req: Request) => {
  const searchParams = new URL(req.url || '').searchParams
  const space = searchParams.get('space') as string
  const tag = searchParams.get('tag') as BlockTag

  const {
    options: { strategies, network },
    addresses: _addresses,
  } = (await req.json()) as VotingPowerRequestBody

  const addresses = _addresses
    .map((address) => getAddress(address))
    .sort() as Address[]

  const { blockNumber, chain } = await loadBlockTag(tag, network)
  await syncTip(blockNumber, chain)

  const { votingPower } = await loadPower({
    chain,
    blockNumber,
    space,
    strategies,
    voters: addresses,
  })

  const response = Object.fromEntries(
    addresses.map((address) => [address, votingPower[address]])
  )

  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' },
  })
}
