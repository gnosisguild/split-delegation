import { BlockTag, getAddress } from 'viem'

import calculateAddressView from '../../../../src/calculations/addressView'
import calculateDelegations from '../../../../src/calculations/delegations'
import createVotingPower from '../../../../src/actions/createVotingPower'
import resolveBlockTag from '../../../../src/loaders/resolveBlockTag'

import { syncTip } from '../../../../src/commands/sync'

import { DelegatorRequestBody } from '../../../../src/types'

export const POST = async (req: Request) => {
  const searchParams = new URL(req.url || '').searchParams
  const space = searchParams.get('space') as string
  const tag = searchParams.get('tag') as BlockTag
  const address = getAddress(searchParams.get('address') as string)

  const { strategies, network, totalSupply } =
    (await req.json()) as DelegatorRequestBody

  const { chain, blockNumber } = await resolveBlockTag(tag, network)

  await syncTip(chain, blockNumber)

  const { weights, votingPower: votingPowerMap } = await createVotingPower({
    chain,
    blockNumber,
    space,
    strategies,
    addresses: {
      include: [address],
    },
  })

  const delegations = calculateDelegations({ weights })

  const {
    votingPower,
    percentOfVotingPower,
    percentOfDelegators,
    delegates,
    delegators,
  } = calculateAddressView({
    weights,
    delegations,
    votingPower: votingPowerMap,
    totalSupply,
    address,
  })

  const response = {
    chainId: chain.id,
    blockNumber,
    address,
    votingPower,
    percentOfVotingPower,
    percentOfDelegators,
    delegates,
    delegators,
  }

  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' },
  })
}
