import { Address, BlockTag, getAddress } from 'viem'

import resolveBlockTag from '../../../../src/loaders/resolveBlockTag'

import { syncTip } from '../../../../src/commands/sync'
import { VotingPowerRequestBody } from '../../types'
import loadWeights from 'src/loaders/loadWeights'
import kahn from 'src/fns/graph/sort'
import loadScores from 'src/loaders/loadScores'
import calculateVotingPower from 'src/calculations/votingPower'
import createDelegationGraph from 'src/fns/delegations/createDelegationGraph'

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

  const { weights } = await loadWeights({ chain, blockNumber, space })

  const order = kahn(weights)

  const delegations = createDelegationGraph({ weights, order })

  const { scores } = await loadScores({
    chain,
    blockNumber,
    space,
    strategies,
    addresses: order,
  })

  const result = Object.fromEntries(
    addresses.map((address) => [
      address,
      calculateVotingPower({
        delegations,
        scores,
        address,
      }),
    ])
  )

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  })
}
