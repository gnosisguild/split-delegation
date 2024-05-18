import { Address, BlockTag, getAddress } from 'viem'

import calculateVotingPower from '../../../../src/calculations/votingPower'
import filterVertices from '../../../../src/fns/graph/filterVertices'
import inputsFor from '../../../../src/fns/graph/inputsFor'
import inverse from '../../../../src/fns/graph/inverse'

import loadScores from '../../../../src/loaders/loadScores'
import loadWeights from '../../../../src/loaders/loadWeights'
import resolveBlockTag from '../../../../src/loaders/resolveBlockTag'

import { syncTip } from '../../../../src/commands/sync'

import { VotingPowerRequestBody } from '../../types'

export const POST = async (req: Request) => {
  const searchParams = new URL(req.url || '').searchParams
  const space = searchParams.get('space') as string
  const tag = searchParams.get('tag') as BlockTag

  const {
    options: { strategies, network, delegationOverride = true },
    addresses: _addresses,
  } = (await req.json()) as VotingPowerRequestBody

  const voters = _addresses
    .map((address) => getAddress(address))
    .sort() as Address[]

  const { chain, blockNumber } = await resolveBlockTag(tag, network)
  await syncTip(chain, blockNumber)

  let { weights, rweights } = await loadWeights({
    chain,
    blockNumber,
    space,
  })

  /*
   * If delegation override is enabled, we filter out every edge from accounts
   * that have voted
   */
  if (delegationOverride && voters.length > 0) {
    weights = filterVertices(weights, voters)
    rweights = inverse(weights)
  }

  const { scores } = await loadScores({
    chain,
    blockNumber,
    space,
    strategies,
    addresses: inputsFor(rweights, voters),
  })

  const result = Object.fromEntries(
    voters.map((voter) => [
      voter,
      calculateVotingPower({
        weights,
        rweights,
        scores,
        address: voter,
      }).votingPower,
    ])
  ) as Record<string, number>

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  })
}
