import { describe, test } from '@jest/globals'
import { Address } from 'viem'

import delegateStats from './delegateStats'
import inverse from '../fns/graph/inverse'

describe('delegateStats', () => {
  const A = 'A' as Address
  const B = 'B' as Address
  const C = 'C' as Address
  const D = 'D' as Address
  const E = 'E' as Address

  test('it computes stats', () => {
    const weights = {
      [A]: {
        [B]: 50,
        [C]: 50,
      },
      [D]: {
        [E]: 100,
      },
    }

    const rweights = inverse(weights)

    const scores = {
      [A]: 1000,
      [B]: 30,
      [C]: 50,
      [D]: 20,
      [E]: 30,
    }

    const totalSupply = 1000 + 30 + 50 + 20 + 30

    const result = delegateStats({
      weights,
      rweights,
      scores,
      totalSupply,
    })

    expect(result).toEqual([
      {
        address: B,
        delegatorCount: 1,
        votingPower: 530,
        percentOfDelegators: 5000,
        percentOfVotingPower: Math.round((530 * 10000) / totalSupply),
      },
      {
        address: C,
        delegatorCount: 1,
        percentOfDelegators: 5000,
        votingPower: 550,
        percentOfVotingPower: Math.round((550 * 10000) / totalSupply),
      },
      {
        address: E,
        delegatorCount: 1,
        percentOfDelegators: 5000,
        votingPower: 50,
        percentOfVotingPower: Math.round((50 * 10000) / totalSupply),
      },
    ])
  })
})
