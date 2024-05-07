import { describe, test } from '@jest/globals'
import { Address } from 'viem'

import delegateStats from './delegateStats'

describe('delegateStats', () => {
  const A = 'A' as Address
  const B = 'B' as Address
  const C = 'C' as Address
  const D = 'D' as Address
  const E = 'E' as Address

  test('it works', () => {
    const votingPower = {
      [A]: 20,
      [B]: 30,
      [C]: 50,
    }
    const delegators = {
      all: [A, B, C, D, E],
      [A]: [A, B, C],
      [B]: [A, C],
      [C]: [],
    }

    const result = delegateStats({
      totalSupply: 100,
      votingPower,
      delegators,
    })

    // TODO expand these tests
    expect(result).toEqual([
      {
        address: A,
        delegators: [A, B, C],
        votingPower: 20,
        percentOfDelegators: 6000,
        percentOfVotingPower: 2000,
      },
      {
        address: B,
        delegators: [A, C],
        votingPower: 30,
        percentOfDelegators: 4000,
        percentOfVotingPower: 3000,
      },
      {
        address: C,
        delegators: [],
        votingPower: 0,
        percentOfDelegators: 0,
        percentOfVotingPower: 0,
      },
    ])
  })
})
