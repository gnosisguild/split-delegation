import { mainnet } from 'viem/chains'

import delegateStats, { DelegateStats } from '../../src/fns/delegateStats'
import loadPower from '../loaders/loadPower'

/*
 * Called while syncing the DB
 */

/*
  {
    spaceId: '0x6c69646f2d736e617073686f742e657468000000000000000000000000000000',
    space: 'lido-snapshot.eth\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00',
    count: 59304
  },
  {
    spaceId: '0x6376782e65746800000000000000000000000000000000000000000000000000',
    space: 'cvx.eth\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00',
    count: 29246
  },
  {
    spaceId: '0x736166652e657468000000000000000000000000000000000000000000000000',
    space: 'safe.eth\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00',
    count: 26198
  },
  {
    spaceId: '0x0000000000000000000000000000000000000000000000000000000000000000',
    space: '\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00',
    count: 22309
  },
  {
    spaceId: '0x737461726b6e65742e6574680000000000000000000000000000000000000000',
    space: 'starknet.eth\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00',
    count: 12560
  },
  {
    spaceId: '0x73746764616f2e65746800000000000000000000000000000000000000000000',
    space: 'stgdao.eth\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00',
    count: 6803
  },
  {
    spaceId: '0x67656172626f782e657468000000000000000000000000000000000000000000',
    space: 'gearbox.eth\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00',
    count: 4552
  },
  {
    spaceId: '0x726f636b6574706f6f6c2d64616f2e6574680000000000000000000000000000',
    space: 'rocketpool-dao.eth\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00',
    count: 3501
  },
*/

export default async function doStuff({
  space,
  totalSupply,
  strategies,
}: {
  space: string
  totalSupply: number
  strategies: any[]
}) {
  const { votingPower, delegatorCount } = await loadPower({
    chain: mainnet,
    blockNumber: 19760000,
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

doStuff({
  space: 'rocketpool-dao.eth',
  totalSupply: 20292984,
  strategies: [
    {
      name: 'rocketpool-node-operator-v3',
      network: '1',
      params: {
        symbol: 'RPL',
        address: '0xD33526068D116cE69F19A9ee46F0bd304F21A51f',
        decimals: 18,
      },
    },
  ],
})

// doStuff({
//   space: 'lido-snapshot.eth',
//   totalSupply: 1000000000,
//   strategies: [
//     {
//       name: 'erc20-balance-of',
//       network: '1',
//       params: {
//         symbol: 'LDO',
//         address: '0x5a98fcbea516cf06857215779fd812ca3bef1b32',
//         decimals: 18,
//       },
//     },
//   ],
// })

// function orderByCount(a: DelegateStats, b: DelegateStats) {
//   return a.delegatorCount > b.delegatorCount ? -1 : 1
// }

function orderByPower(a: DelegateStats, b: DelegateStats) {
  return a.votingPower > b.votingPower ? -1 : 1
}
