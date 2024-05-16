import { describe, test } from '@jest/globals'
import { Address } from 'viem'

import delegateStats from './delegateStats'
import calculateDelegations from './delegations'

describe('delegateStats', () => {
  const A = 'A' as Address
  const B = 'B' as Address
  const C = 'C' as Address
  const D = 'D' as Address
  const E = 'E' as Address

  test('it works', () => {
    const weights = {
      [A]: {
        [B]: 50,
        [C]: 50,
      },
      [D]: {
        [E]: 100,
      },
    }
    const delegations = calculateDelegations({ weights })

    const scores = {
      [A]: 1000,
      [B]: 30,
      [C]: 50,
      [D]: 20,
      [E]: 30,
    }

    const result = delegateStats({
      weights,
      delegations,
      scores,
      totalSupply: 100,
    })

    expect(result).toEqual([
      {
        address: B,
        delegatorCount: 1,
        votingPower: 530,
        percentOfDelegators: 5000,
        percentOfVotingPower: 3000,
      },
      {
        address: C,
        delegatorCount: 1,
        percentOfDelegators: 5000,
        votingPower: 550,
        percentOfVotingPower: 5000,
      },
      {
        address: E,
        delegatorCount: 1,
        percentOfDelegators: 5000,
        votingPower: 50,
        percentOfVotingPower: 3000,
      },
    ])
  })
})
