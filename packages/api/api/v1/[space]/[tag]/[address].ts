import { Address, BlockTag, getAddress } from 'viem'

import calculateDelegations from '../../../../src/calculations/delegations'
import calculateVotingPower from '../../../../src/calculations/votingPower'
import kahn from '../../../../src/fns/graph/sort'

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

  const { weights } = await loadWeights({
    chain,
    blockNumber,
    space,
  })

  const order = kahn(weights, [address]) as Address[]

  const { scores } = await loadScores({
    chain,
    blockNumber,
    space,
    strategies,
    addresses: order,
  })

  const {
    votingPower,
    percentOfVotingPower,
    percentOfDelegators,
    delegates,
    delegators,
  } = calculateDelegations({
    weights,
    votingPower: calculateVotingPower({ weights, scores, order }),
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

// {
//     "chainId": 1,
//     "blockNumber": 19840583,
//     "address": "0x485E60C486671E932fd9C53d4110cdEab1E7F0eb",
//     "delegatorCount": 0,
//     "percentOfDelegators": 0,
//     "votingPower": 0,
//     "percentOfVotingPower": 0,
//     "delegates": [
//         {
//             "address": "0x37F1eE65C2F8610741cd9Dff1057F926809C4078",
//             "direct": true,
//             "delegatedPercent": "50", // how much weight this address gave to this delegate
//             "delegatedPower": 21.715405067696775, // how much voting power this address gave to this delegate
//         }
//     ],
//     "delegators": [
//         {
//             "address": "0x37F1eE65C2F8610741cd9Dff1057F926809C4078",
//             "direct": true,
//             "delegatedPercent": "50", // how much weight given to this address
//             "delegatedPower": 21.715405067696775, // how much voting power given to this address
//         }
//     ]
// }
