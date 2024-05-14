import { BlockTag, getAddress } from 'viem'

import calculateAddressView from '../../../../src/calculations/addressView'
import createDelegations from '../../../../src/actions/createDelegations'
import createVotingPower from '../../../../src/actions/createVotingPower'
import loadWeights from '../../../../src/loaders/loadWeights'
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

  const { weights } = await loadWeights({
    chain,
    blockNumber,
    space,
  })

  const votingPowerMap = await createVotingPower({
    chain,
    blockNumber,
    space,
    strategies,
  })

  const delegations = await createDelegations({
    chain,
    blockNumber,
    space,
  })

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
