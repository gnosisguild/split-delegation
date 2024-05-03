import { BlockTag } from 'viem'

import delegateStats, { DelegateStats } from '../../../../src/fns/delegateStats'

import resolveBlockTag from '../../../../src/loaders/resolveBlockTag'
import loadPower from '../../../../src/loaders/loadPower'

import { syncTip } from '../../../../src/commands/sync'
import { DelegateRequestBody } from 'src/types'

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

  const { votingPower, delegatorCount } = await loadPower({
    chain,
    blockNumber,
    space,
    strategies,
  })

  const _result = delegateStats({
    totalSupply,
    votingPower,
    delegatorCount,
  })

  const result = _result
    .sort(orderBy == 'count' ? orderByCount : orderByPower)
    .slice(offset, offset + limit)

  const response = { delegates: result }

  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' },
  })
}

function orderByCount(a: DelegateStats, b: DelegateStats) {
  return a.delegatorCount > b.delegatorCount ? -1 : 1
}
function orderByPower(a: DelegateStats, b: DelegateStats) {
  return a.votingPower > b.votingPower ? -1 : 1
}
