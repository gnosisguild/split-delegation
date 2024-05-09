import { BlockTag, getAddress } from 'viem'

import bfs from '../../../../../src/fns/graph/bfs'
import loadPower from '../../../../../src/loaders/loadPower'
import resolveBlockTag from '../../../../../src/loaders/resolveBlockTag'

import { syncTip } from '../../../../../src/commands/sync'

import { DelegatorRequestBody } from '../../../../../src/types'
import loadDelegates from '../../../../../src/loaders/loadDelegates'

export const POST = async (req: Request) => {
  const searchParams = new URL(req.url || '').searchParams
  const space = searchParams.get('space') as string
  const tag = searchParams.get('tag') as BlockTag
  const delegator = getAddress(searchParams.get('address') as string)

  const { strategies, network, totalSupply } =
    (await req.json()) as DelegatorRequestBody

  const { chain, blockNumber } = await resolveBlockTag(tag, network)

  await syncTip(chain, blockNumber)

  const { weights } = await loadPower({
    chain,
    blockNumber,
    space,
    strategies,
  })

  const allDelegateStats = await loadDelegates({
    chain,
    blockNumber,
    space,
    strategies,
    totalSupply,
  })

  const delegates = bfs(weights, delegator)

  const response = {
    chainId: chain.id,
    blockNumber,
    address: delegator,
    delegates: delegates.map((delegate) =>
      allDelegateStats.find((s) => s.address == delegate)
    ),
  }

  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' },
  })
}
