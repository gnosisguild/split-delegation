import { BlockTag } from 'viem'

import {
  orderByCount,
  orderByPower,
} from '../../../../src/calculations/delegateStats'

import loadTopDelegates from '../../../../src/loaders/loadTopDelegates'

import resolveBlockTag from '../../../../src/loaders/resolveBlockTag'

import { TopDelegatesRequestBody } from '../../types'

export const POST = async (req: Request) => {
  const searchParams = new URL(req.url || '').searchParams
  const space = searchParams.get('space') as string
  const tag = searchParams.get('tag') as BlockTag

  const {
    strategy: {
      name,
      network,
      params: { strategies, totalSupply },
    },
  } = (await req.json()) as TopDelegatesRequestBody

  if (name != 'split-delegation') {
    return new Response(JSON.stringify({ error: `Invalid Strategy ${name}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (typeof totalSupply != 'number') {
    return new Response(JSON.stringify({ error: `Total Supply Missing` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const limit = Number(searchParams.get('limit')) || 100
  const offset = Number(searchParams.get('offset')) || 0
  const orderBy = searchParams.get('by')

  if (orderBy != 'count' && orderBy != 'power') {
    return new Response('invalid orderBy', { status: 400 })
  }

  // const { chain, blockNumber } = await syncTip(tag, network)
  const { chain, blockNumber } = await resolveBlockTag(tag, network)

  const topDelegates = await loadTopDelegates({
    chain,
    blockNumber,
    space,
    strategies,
    totalSupply: totalSupply!,
  })

  const response = {
    chainId: chain.id,
    blockNumber,
    delegates: topDelegates
      .sort(orderBy == 'count' ? orderByCount : orderByPower)
      .slice(offset, offset + limit),
    pagination: {
      offset,
      limit,
      total: topDelegates.length,
    },
  }

  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' },
  })
}
