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

import loadScores from '../../../../src/loaders/loadScores'
import loadWeights from '../../../../src/loaders/loadWeights'

import { syncTip } from '../../../../src/commands/sync'

import { AddressRequestBody } from '../../types'

export type AddressResult = {
  address: string
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
  const address = getAddress(searchParams.get('address') as string)

  const {
    strategy: {
      name,
      network,
      params: { strategies, totalSupply },
    },
  } = (await req.json()) as AddressRequestBody

  if (name != 'split-delegation') {
    new Response(JSON.stringify({ error: `Invalid Strategy ${name}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (typeof totalSupply != 'number') {
    new Response(JSON.stringify({ error: `Total Supply Missing` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { chain, blockNumber } = await syncTip(tag, network)

  const { delegations } = await loadWeights({ chain, blockNumber, space })

  const { scores } = await loadScores({
    chain,
    blockNumber,
    space,
    strategies,
    addresses: inputsFor(delegations, address),
  })

  const {
    votingPower,
    incomingPower,
    outgoingPower,
    percentOfVotingPower,
    percentOfDelegators,
  } = addressStats({
    delegations,
    scores,
    totalSupply: totalSupply!,
    allDelegatorCount: Object.keys(delegations.forward).length,
    address,
  })

  const result: AddressResult = {
    address,
    votingPower,
    incomingPower,
    outgoingPower,
    percentOfVotingPower,
    percentOfDelegators,
    delegators: reachable(delegations.reverse, address),
    delegatorTree: delegatorTree({ delegations, scores, address }),
    delegates: reachable(delegations.forward, address),
    delegateTree: delegateTree({ delegations, scores, address }),
  }

  return new Response(
    JSON.stringify({ chainId: chain.id, blockNumber, ...result }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
