import { BlockTag } from 'viem'
import type { VercelRequest, VercelResponse } from '@vercel/node'

import spaceId from 'src/fns/spaceId'
import parseRows from 'src/fns/parseRows'

import top from 'src/actions/top'
import { syncTip as sync } from 'src/commands/sync'

import setCORS from 'routes/setCORS'

import prisma from '../../../../../prisma/singleton'

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

type TopResponse = {
  delegates: DelegateResponse[]
}

type DelegateResponse = {
  address: string
  delegatorCount: number
  // TODO percentOfDelegators: number
  // TODO percentOfVotes: number
  // TODO votingPower: number
}

export const GET = async (req: VercelRequest, res: VercelResponse) => {
  if (setCORS(req, res)) return

  const space = req.query.space as string
  const tag = req.query.space as BlockTag

  // weight caching will come in here

  await sync(tag)

  const actions = parseRows(
    await prisma.delegationEvent.findMany({
      where: { spaceId: spaceId(space) },
      orderBy: { blockTimestamp: 'asc' },
    })
  )

  const result = await top(actions, Date.now(), {
    limit: 20,
    offset: 0,
    orderBy: 'count',
  })

  const response = { delegates: result }

  res.json(response)
}
