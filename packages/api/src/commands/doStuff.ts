import { mainnet } from 'viem/chains'

import delegateStats, { DelegateStats } from '../../src/fns/delegateStats'
import loadPower from '../loaders/loadPower'
import loadPin from 'src/loaders/loadPin'

export default async function doStuff({
  space,
  totalSupply,
  strategies,
}: {
  space: string
  totalSupply: number
  strategies: any[]
}) {
  const { blockNumber } = await loadPin(mainnet)

  const { votingPower, delegatorCount } = await loadPower({
    chain: mainnet,
    blockNumber,
    space,
    strategies,
  })

  const _result = delegateStats({
    totalSupply,
    votingPower,
    delegatorCount,
  })

  const result = _result.sort(orderByPower).slice(0, 10)
  console.log(JSON.stringify(result, null, 2))
}

function safeVotingPower() {
  return doStuff({
    space: 'safe.eth',
    totalSupply: 1000000000,
    strategies: [
      {
        name: 'erc20-balance-of',
        network: '1',
        params: {
          symbol: 'SAFE',
          address: '0x5aFE3855358E112B5647B952709E6165e1c1eEEe',
          decimals: 18,
        },
      },
      {
        name: 'safe-vested',
        network: '1',
        params: {
          symbol: 'SAFE (vested)',
          claimDateLimit: '2022-12-27T10:00:00+00:00',
          allocationsSource:
            'https://safe-claiming-app-data.safe.global/allocations/1/snapshot-allocations-data.json',
        },
      },
      {
        name: 'contract-call',
        network: '1',
        params: {
          symbol: 'SAFE (locked)',
          address: '0x0a7CB434f96f65972D46A5c1A64a9654dC9959b2',
          decimals: 18,
          methodABI: {
            name: 'getUserTokenBalance',
            type: 'function',
            inputs: [
              {
                name: 'holder',
                type: 'address',
                internalType: 'address',
              },
            ],
            outputs: [
              {
                name: '',
                type: 'uint96',
                internalType: 'uint96',
              },
            ],
            stateMutability: 'view',
          },
        },
      },
    ],
  })
}

function cowVotingPower() {
  return doStuff({
    space: 'cow.eth',
    totalSupply: 1000000000,
    strategies: [
      {
        name: 'erc20-balance-of',
        network: '1',
        params: {
          symbol: 'vCOW (mainnet)',
          address: '0xd057b63f5e69cf1b929b356b579cba08d7688048',
          decimals: 18,
        },
      },
      {
        name: 'erc20-balance-of',
        network: '100',
        params: {
          symbol: 'vCOW (GC)',
          address: '0xc20C9C13E853fc64d054b73fF21d3636B2d97eaB',
          decimals: 18,
        },
      },
      {
        name: 'erc20-balance-of',
        network: '1',
        params: {
          symbol: 'COW (Mainnet)',
          address: '0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB',
          decimals: 18,
        },
      },
      {
        name: 'erc20-balance-of',
        network: '100',
        params: {
          symbol: 'COW (GC)',
          address: '0x177127622c4A00F3d409B75571e12cB3c8973d3c',
          decimals: 18,
        },
      },
    ],
  })
}

function lidoVotingPower() {
  return doStuff({
    space: 'lido-snapshot.eth',
    totalSupply: 1000000000,
    strategies: [
      {
        name: 'erc20-balance-of',
        network: '1',
        params: {
          symbol: 'LDO',
          address: '0x5a98fcbea516cf06857215779fd812ca3bef1b32',
          decimals: 18,
        },
      },
    ],
  })
}

// function orderByCount(a: DelegateStats, b: DelegateStats) {
//   return a.delegatorCount > b.delegatorCount ? -1 : 1
// }

function orderByPower(a: DelegateStats, b: DelegateStats) {
  return a.votingPower > b.votingPower ? -1 : 1
}

async function votingPower() {
  await safeVotingPower()
  await cowVotingPower()
  await lidoVotingPower()
}

votingPower()
