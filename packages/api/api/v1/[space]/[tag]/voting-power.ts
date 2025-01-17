import { BlockTag, getAddress } from 'viem'

import calculateVotingPower from '../../../../src/calculations/votingPower'
import filterVertices from '../../../../src/fns/graph/filterVertices'
import inputsFor from '../../../../src/fns/delegations/inputsFor'
import inverse from '../../../../src/fns/graph/inverse'

import loadDelegationDAGs from '../../../../src/loaders/loadDelegationDAGs'
import loadScores from '../../../../src/loaders/loadScores'

import resolveBlockTag from '../../../../src/loaders/resolveBlockTag'

import { VotingPowerRequestBody } from '../../types'

export const POST = async (req: Request) => {
  const searchParams = new URL(req.url || '').searchParams
  const space = searchParams.get('space') as string
  const tag = searchParams.get('tag') as BlockTag

  const {
    strategy: {
      name,
      network,
      params: { strategies, delegationOverride = false },
    },
    addresses,
  } = (await req.json()) as VotingPowerRequestBody

  if (name != 'split-delegation') {
    return new Response(JSON.stringify({ error: `Invalid Strategy ${name}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { chain, blockNumber } = await resolveBlockTag(tag, network)

  let dags = await loadDelegationDAGs({
    chain,
    blockNumber,
    space,
  })

  const voters = addresses
    .map((address) => getAddress(address).toLowerCase())
    .sort()

  /*
   * If delegation override is enabled, we filter edges (delegations)
   * from accounts that have voted
   */
  if (delegationOverride && voters.length > 0) {
    const forward = filterVertices(dags.forward, voters)
    const reverse = inverse(forward)
    dags = { forward, reverse }
  }

  const scores = await loadScores({
    chain,
    blockNumber,
    space,
    strategies,
    addresses: inputsFor(dags, voters),
  })

  const result = Object.fromEntries(
    voters.map((voter) => [
      voter,
      calculateVotingPower({ dags, scores, address: voter }).votingPower,
    ])
  ) as Record<string, number>

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  })
}
