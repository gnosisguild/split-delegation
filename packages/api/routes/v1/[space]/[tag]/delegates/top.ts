import { BlockTag } from 'viem'
import { mainnet } from 'viem/chains'
import type { VercelRequest } from '@vercel/node'

import { syncTip } from 'src/commands/sync'
import blockTagToNumber from 'src/actions/blockTagToNumber'
import top from 'src/actions/top'

import createClient from 'src/loaders/createClient'
import loadDelegates from 'src/loaders/loadDelegates'
import loadDelegators from 'src/loaders/loadDelegators'

// /api/v1/safe.ggtest.eth/latest/delegates/top

// response {
//   delegates: [
//     {
//       address: "0x",
//       delegatorCount: 0,
//       percentOfDelegatesBPS: 0,
//       percentOfVotesBPS: 0,
//       votingPower: 0
//     }
//   ]
// }

// should support query params:
// - limit: number
// - offset: number
// - by: 'weight' | 'count'

export const GET = async (req: VercelRequest) => {
  const space = req.query.space as string
  const tag = req.query.space as BlockTag

  const {
    options: { strategies, network },
  } = req.body

  // TODO CACHING

  const limit = Number(req.query.limit) || 100
  const offset = Number(req.query.offset) || 0
  const orderBy = req.query.by

  if (orderBy != 'count' && orderBy != 'weight') {
    return new Response('invalid orderBy', { status: 400 })
  }

  const blockNumber = await blockTagToNumber(tag, createClient(mainnet))

  await syncTip(space, blockNumber)

  const { weights: delegatorWeights, scores: delegatorScores } =
    await loadDelegators({
      space,
      strategies,
      network,
      blockNumber,
    })

  const { weights: delegateWeights, scores: delegateScores } =
    await loadDelegates({
      delegatorWeights,
      delegatorScores,
      addresses: [],
    })

  const result = await top(
    {
      delegateWeights,
      delegateScores,
    },
    {
      limit,
      offset,
      orderBy,
    }
  )
  const response = { delegates: result }

  return new Response(JSON.stringify(response))
}
