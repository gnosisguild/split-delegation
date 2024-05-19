import { BlockTag } from 'viem'

import {
  orderByCount,
  orderByPower,
} from '../../../../src/calculations/delegateStats'

import loadTopDelegates from '../../../../src/loaders/loadTopDelegates'

import { syncTip } from '../../../../src/commands/sync'

import { TopDelegatesRequestBody } from '../../types'

export const POST = async (req: Request) => {
  const searchParams = new URL(req.url || '').searchParams
  const space = searchParams.get('space') as string
  const tag = searchParams.get('tag') as BlockTag
  const { totalSupply, strategies, network } =
    (await req.json()) as TopDelegatesRequestBody

  const limit = Number(searchParams.get('limit')) || 100
  const offset = Number(searchParams.get('offset')) || 0
  const orderBy = searchParams.get('by')

  if (orderBy != 'count' && orderBy != 'power') {
    return new Response('invalid orderBy', { status: 400 })
  }

  const { chain, blockNumber } = await syncTip(tag, network)

  const topDelegates = await loadTopDelegates({
    chain,
    blockNumber,
    space,
    strategies,
    totalSupply,
  })

  const response = {
    chainId: chain.id,
    blockNumber,
    delegates: topDelegates
      .sort(orderBy == 'count' ? orderByCount : orderByPower)
      .slice(offset, offset + limit),
  }

  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' },
  })
}
