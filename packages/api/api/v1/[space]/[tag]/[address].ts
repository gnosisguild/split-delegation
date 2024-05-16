import { BlockTag, getAddress } from 'viem'

import allNodes from '../../../../src/fns/graph/allNodes'
import calculateAddressView from '../../../../src/calculations/addressView'
import createDelegationGraph from '../../../../src/fns/delegations/createDelegationGraph'

import loadScores from '../../../../src/loaders/loadScores'
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

  const { weights } = await loadWeights({ chain, blockNumber, space })
  const { scores } = await loadScores({
    chain,
    blockNumber,
    space,
    strategies,
    addresses: Array.from(new Set([...allNodes(weights), address])),
  })

  const delegations = createDelegationGraph({ weights })

  const {
    votingPower,
    percentOfVotingPower,
    percentOfDelegators,
    delegates,
    delegators,
  } = calculateAddressView({
    address,
    delegations,
    scores,
    totalSupply,
    totalDelegators: Object.keys(weights).length,
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
