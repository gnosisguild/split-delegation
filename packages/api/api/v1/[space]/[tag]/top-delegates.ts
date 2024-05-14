import { BlockTag } from 'viem'

import {
  orderByCount,
  orderByPower,
} from '../../../../src/calculations/delegateStats'
import createTopDelegates from '../../../../src/actions/createTopDelegates'
import resolveBlockTag from '../../../../src/loaders/resolveBlockTag'

import { syncTip } from '../../../../src/commands/sync'

import { DelegateRequestBody } from '../../../../src/types'

export const POST = async (req: Request) => {
  const searchParams = new URL(req.url || '').searchParams
  const space = searchParams.get('space') as string
  const tag = searchParams.get('tag') as BlockTag
  const { totalSupply, strategies, network } =
    (await req.json()) as DelegateRequestBody

  const limit = Number(searchParams.get('limit')) || 100
  const offset = Number(searchParams.get('offset')) || 0
  const orderBy = searchParams.get('by')

  if (orderBy != 'count' && orderBy != 'power') {
    return new Response('invalid orderBy', { status: 400 })
  }

  const { chain, blockNumber } = await resolveBlockTag(tag, network)
  await syncTip(chain, blockNumber)

  const topDelegates = await createTopDelegates({
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
