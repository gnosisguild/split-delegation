import { describe, test } from '@jest/globals'
import { Address } from 'viem'

import delegateStats from './delegateStats'

describe('delegateStats', () => {
  const A = 'A' as Address
  const B = 'B' as Address
  const C = 'C' as Address

  test('it works', () => {
    const delegatedPower = {
      [A]: 10,
      [B]: 20,
      [C]: 0,
    }
    const delegatorCount = {
      all: 5,
      [A]: 3,
      [B]: 2,
      [C]: 0,
    }
    const scores = {
      [A]: 30,
      [B]: 20,
      [C]: 10,
    }

    const result = delegateStats({
      totalSupply: 100,
      delegatedPower,
      delegatorCount,
      scores,
    })

    // TODO expand these tests
    expect(result).toEqual([
      {
        address: A,
        delegatorCount: 3,
        votingPower: 40,
        percentOfDelegators: 6000,
        percentOfVotingPower: 4000,
      },
      {
        address: B,
        delegatorCount: 2,
        votingPower: 40,
        percentOfDelegators: 4000,
        percentOfVotingPower: 4000,
      },
      {
        address: C,
        delegatorCount: 0,
        votingPower: 10,
        percentOfDelegators: 0,
        percentOfVotingPower: 1000,
      },
    ])
  })
})
