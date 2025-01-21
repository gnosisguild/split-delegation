import { BlockTag } from 'viem'

import {
  orderByCount,
  orderByPower,
} from '../../../../src/calculations/delegateStats'

import loadTopDelegates from '../../../../src/loaders/loadTopDelegates'
import resolveBlockTag, {
  networkToChain,
} from '../../../../src/loaders/resolveBlockTag'

import { TopDelegatesRequestBody } from '../../types'

const headers = { 'Content-Type': 'application/json' }

export const POST = async (req: Request) => {
  const searchParams = new URL(req.url || '').searchParams
  const space = searchParams.get('space') as string
  const blockTag = searchParams.get('tag') as BlockTag
  const limit = Number(searchParams.get('limit')) || 100
  const offset = Number(searchParams.get('offset')) || 0
  const orderBy = searchParams.get('by')

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
      headers,
    })
  }

  if (typeof totalSupply != 'number') {
    return new Response(JSON.stringify({ error: `Total Supply Missing` }), {
      status: 400,
      headers,
    })
  }

  const chain = networkToChain(network)
  if (!chain) {
    return new Response(
      JSON.stringify({ error: `Network Not Supported "${network}"` }),
      { status: 404, headers }
    )
  }

  const blockNumber = await resolveBlockTag(chain, blockTag)
  if (!blockNumber) {
    return new Response(
      JSON.stringify({
        error: `Block Not Found "${blockTag}" @ ${chain.name}`,
      }),
      { status: 404, headers }
    )
  }

  if (orderBy != 'count' && orderBy != 'power') {
    return new Response(`invalid orderBy`, { status: 400, headers })
  }

  const { topDelegates } = await loadTopDelegates({
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

  return new Response(JSON.stringify(response), { headers })
}
