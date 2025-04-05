import { Address, BlockTag, getAddress, isAddress } from 'viem'

import addressStats from '../../../../src/calculations/addressStats'
import delegateTree, {
  DelegateTreeNode,
} from '../../../../src/calculations/delegateTree'
import delegatorTree, {
  DelegatorTreeNode,
} from '../../../../src/calculations/delegatorTree'
import inputsFor from '../../../../src/fns/delegations/inputsFor'
import reachable from '../../../../src/fns/graph/reachable'

import loadBlockFinality from '../../../../src/loaders/loadBlockFinality'
import loadDelegationDAGs from '../../../../src/loaders/loadDelegationDAGs'
import loadScores from '../../../../src/loaders/loadScores'

import resolveBlockTag, {
  networkToChain,
} from '../../../../src/loaders/resolveBlockTag'

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

const headers = { 'Content-Type': 'application/json' }

export const POST = async (req: Request) => {
  const searchParams = new URL(req.url || '').searchParams
  const space = searchParams.get('space') as string
  const blockTag = searchParams.get('tag') as BlockTag
  let address = searchParams.get('address') as string
  const finalizedOnly = ['true', 'yes'].includes(
    searchParams.get('finalized_only') || ''
  )

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
      headers,
    })
  }

  if (typeof totalSupply != 'number') {
    return new Response(JSON.stringify({ error: `Total Supply Missing` }), {
      status: 400,
      headers,
    })
  }

  if (!isAddress(address)) {
    return new Response(
      JSON.stringify({ error: `Invalid Address "${address}"` }),
      { status: 400, headers }
    )
  }
  address = String(address).toLowerCase() as Address

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

  if (finalizedOnly) {
    const isFinal = await loadBlockFinality(chain, blockNumber)
    if (!isFinal) {
      return new Response(
        JSON.stringify({
          error: `Block"${blockNumber}" @ ${chain.name} is too recent`,
        }),
        { status: 400, headers }
      )
    }
  }

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

  const result: AddressResult = checksum({
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
  })

  return new Response(
    JSON.stringify({ chainId: chain.id, blockNumber, ...result }),
    { headers }
  )
}

function checksum(result: AddressResult) {
  return {
    ...result,
    address: getAddress(result.address),
    delegators: result.delegators.map((delegator) => getAddress(delegator)),
    delegatorTree: result.delegatorTree.map(checksumDelegatorTree),
    delegates: result.delegates.map((delegate) => getAddress(delegate)),
    delegateTree: result.delegateTree.map(checksumDelegateTree),
  }
}

function checksumDelegatorTree(node: DelegatorTreeNode): DelegatorTreeNode {
  return {
    ...node,
    delegator: getAddress(node.delegator),
    parents: node.parents.map(checksumDelegatorTree),
  }
}

function checksumDelegateTree(node: DelegateTreeNode): DelegateTreeNode {
  return {
    ...node,
    delegate: getAddress(node.delegate),
    children: node.children.map(checksumDelegateTree),
  }
}
