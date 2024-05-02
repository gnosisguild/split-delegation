import { describe, test } from '@jest/globals'
import { Address } from 'viem'

import delegateStats from './delegateStats'

describe('delegateStats', () => {
  const A = 'A' as Address
  const B = 'B' as Address
  const C = 'C' as Address

  test('it works', () => {
    const votingPower = {
      [A]: 20,
      [B]: 30,
      [C]: 50,
    }
    const delegatorCount = {
      all: 5,
      [A]: 3,
      [B]: 2,
      [C]: 0,
    }

    const result = delegateStats({
      totalSupply: 100,
      votingPower,
      delegatorCount,
    })

    // TODO expand these tests
    expect(result).toEqual([
      {
        address: A,
        delegatorCount: 3,
        votingPower: 20,
        percentOfDelegators: 6000,
        percentOfVotingPower: 2000,
      },
      {
        address: B,
        delegatorCount: 2,
        votingPower: 30,
        percentOfDelegators: 4000,
        percentOfVotingPower: 3000,
      },
      {
        address: C,
        delegatorCount: 0,
        votingPower: 50,
        percentOfDelegators: 0,
        percentOfVotingPower: 5000,
      },
    ])
  })
})
