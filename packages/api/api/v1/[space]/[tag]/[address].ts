import { BlockTag, getAddress } from 'viem'

import addressStats from '../../../../src/calculations/addressStats'
import inputsFor from '../../../../src/fns/graph/inputsFor'

import loadScores from '../../../../src/loaders/loadScores'
import loadWeights from '../../../../src/loaders/loadWeights'
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

  const { weights, rweights } = await loadWeights({ chain, blockNumber, space })
  const { scores } = await loadScores({
    chain,
    blockNumber,
    space,
    strategies,
    addresses: inputsFor(rweights, [address]),
  })

  const {
    votingPower,
    incomingPower,
    outgoingPower,
    percentOfVotingPower,
    percentOfDelegators,
    delegates,
    delegators,
  } = addressStats({
    weights,
    rweights,
    scores,
    totalSupply,
    allDelegatorCount: Object.keys(weights).length,
    address,
  })

  const response = {
    chainId: chain.id,
    blockNumber,
    address,
    votingPower,
    incomingPower,
    outgoingPower,
    percentOfVotingPower,
    percentOfDelegators,
    delegates,
    delegators,
  }

  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' },
  })
}
