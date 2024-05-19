import { BlockTag, getAddress } from 'viem'

import addressStats from '../../../../src/calculations/addressStats'
import delegateTree, {
  DelegateTreeNode,
} from '../../../../src/calculations/delegateTree'
import delegatorTree, {
  DelegatorTreeNode,
} from '../../../../src/calculations/delegatorTree'
import inputsFor from '../../../../src/fns/graph/inputsFor'
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

  const { strategies, network, totalSupply } =
    (await req.json()) as AddressRequestBody

  const { chain, blockNumber } = await syncTip(tag, network)

  const { weights, rweights } = await loadWeights({ chain, blockNumber, space })

  const { scores } = await loadScores({
    chain,
    blockNumber,
    space,
    strategies,
    addresses: inputsFor(rweights, [address]),
  })

  const {
    votingPower,
    incomingPower,
    outgoingPower,
    percentOfVotingPower,
    percentOfDelegators,
  } = addressStats({
    weights,
    rweights,
    scores,
    totalSupply,
    allDelegatorCount: Object.keys(weights).length,
    address,
  })

  const result: AddressResult = {
    address,
    votingPower,
    incomingPower,
    outgoingPower,
    percentOfVotingPower,
    percentOfDelegators,
    delegators: reachable(rweights, address),
    delegatorTree: delegatorTree({ weights, rweights, scores, address }),
    delegates: reachable(weights, address),
    delegateTree: delegateTree({ weights, rweights, scores, address }),
  }

  return new Response(
    JSON.stringify({ chainId: chain.id, blockNumber, ...result }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
