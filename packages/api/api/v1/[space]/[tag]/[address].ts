import { BlockTag, getAddress } from 'viem'

import { inputsFor } from '../../../../src/calculations/participants'
import addressStats from '../../../../src/calculations/addressStats'

import loadGraph from '../../../../src/loaders/loadGraph'
import loadScores from '../../../../src/loaders/loadScores'
import resolveBlockTag from '../../../../src/loaders/resolveBlockTag'

import { syncTip } from '../../../../src/commands/sync'

import { DelegatorRequestBody } from '../../types'

export const POST = async (req: Request) => {
  const searchParams = new URL(req.url || '').searchParams
  const space = searchParams.get('space') as string
  const tag = searchParams.get('tag') as BlockTag
  const address = getAddress(searchParams.get('address') as string)

  const { strategies, network, totalSupply } =
    (await req.json()) as DelegatorRequestBody

  const { chain, blockNumber } = await resolveBlockTag(tag, network)

  await syncTip(chain, blockNumber)

  const { delegations } = await loadGraph({ chain, blockNumber, space })
  const { scores } = await loadScores({
    chain,
    blockNumber,
    space,
    strategies,
    addresses: inputsFor(delegations, [address]),
  })

  const {
    votingPower,
    percentOfVotingPower,
    percentOfDelegators,
    delegates,
    delegators,
  } = addressStats({
    address,
    delegations,
    scores,
    totalSupply,
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
