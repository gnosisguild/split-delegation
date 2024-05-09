import { BlockTag, getAddress } from 'viem'

import bfs from '../../../../../src/fns/graph/bfs'
import delegateStats from '../../../../../src/fns/delegateStats'
import inverse from '../../../../../src/fns/graph/inverse'
import loadPower from '../../../../../src/loaders/loadPower'
import resolveBlockTag from '../../../../../src/loaders/resolveBlockTag'

import { syncTip } from '../../../../../src/commands/sync'

import { DelegateRequestBody } from '../../../../../src/types'

export const POST = async (req: Request) => {
  const searchParams = new URL(req.url || '').searchParams
  const space = searchParams.get('space') as string
  const tag = searchParams.get('tag') as BlockTag
  const delegate = getAddress(searchParams.get('address') as string)

  const { totalSupply, strategies, network } =
    (await req.json()) as DelegateRequestBody

  const { chain, blockNumber } = await resolveBlockTag(tag, network)

  await syncTip(chain, blockNumber)

  const { weights, votingPower, delegatorCount } = await loadPower({
    chain,
    blockNumber,
    space,
    strategies,
  })

  const [stats] = delegateStats({
    address: delegate,
    totalSupply,
    votingPower,
    delegatorCount,
  })

  const delegators = bfs(inverse(weights), delegate)

  const response = {
    ...stats,
    delegators,
  }

  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' },
  })
}
