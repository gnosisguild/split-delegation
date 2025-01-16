import { BlockTag, getAddress } from 'viem'

import addressStats from '../../../../src/calculations/addressStats'
import delegateTree, {
  DelegateTreeNode,
} from '../../../../src/calculations/delegateTree'
import delegatorTree, {
  DelegatorTreeNode,
} from '../../../../src/calculations/delegatorTree'
import inputsFor from '../../../../src/fns/delegations/inputsFor'
import reachable from '../../../../src/fns/graph/reachable'

import loadDelegationDAGs from '../../../../src/loaders/loadDelegationDAGs'
import loadScores from '../../../../src/loaders/loadScores'

import resolveBlockTag from '../../../../src/loaders/resolveBlockTag'

import { AddressRequestBody } from '../../types'

export type AddressResult = {
  address: string
  expiration: number
  votingPower: number
  incomingPower: number
  outgoingPower: number
  delegators: string[]
  delegatorTree: DelegatorTreeNode[]
  delegates: string[]
  delegateTree: DelegateTreeNode[]
  percentOfVotingPower: number
  percentOfDelegators: number
}

export const POST = async (req: Request) => {
  const searchParams = new URL(req.url || '').searchParams
  const space = searchParams.get('space') as string
  const tag = searchParams.get('tag') as BlockTag
  const address = getAddress(
    searchParams.get('address') as string
  ).toLowerCase()

  const {
    strategy: {
      name,
      network,
      params: { strategies, totalSupply },
    },
  } = (await req.json()) as AddressRequestBody

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

  const { chain, blockNumber } = await resolveBlockTag(tag, network)

  const dags = await loadDelegationDAGs({
    chain,
    blockNumber,
    space,
  })

  const scores = await loadScores({
    chain,
    blockNumber,
    space,
    strategies,
    addresses: inputsFor(dags, address),
  })

  const {
    expiration,
    votingPower,
    incomingPower,
    outgoingPower,
    percentOfVotingPower,
    percentOfDelegators,
  } = addressStats({
    dags,
    scores,
    totalSupply: totalSupply!,
    address,
  })

  const result: AddressResult = {
    address,
    expiration,
    votingPower,
    incomingPower,
    outgoingPower,
    percentOfVotingPower,
    percentOfDelegators,
    delegators: reachable(dags.reverse, address),
    delegatorTree: delegatorTree({ dags, scores, address }),
    delegates: reachable(dags.forward, address),
    delegateTree: delegateTree({ dags, scores, address }),
  }

  return new Response(
    JSON.stringify({ chainId: chain.id, blockNumber, ...result }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
