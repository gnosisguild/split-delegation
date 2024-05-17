import { Address, BlockTag, getAddress } from 'viem'

import loadVotingPower from '../../../../src/loaders/loadVotingPower'
import resolveBlockTag from '../../../../src/loaders/resolveBlockTag'

import { syncTip } from '../../../../src/commands/sync'
import { VotingPowerRequestBody } from '../../types'

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

  const { chain, blockNumber } = await resolveBlockTag(tag, network)
  await syncTip(chain, blockNumber)

  const { votingPower } = await loadVotingPower({
    chain,
    blockNumber,
    space,
    strategies,
    addresses: { voters: addresses },
  })

  const result = Object.fromEntries(
    addresses.map((address) => [address, votingPower[address]])
  )

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  })
}
