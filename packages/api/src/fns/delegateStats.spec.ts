import { describe, test } from '@jest/globals'
import { Address } from 'viem'

import delegateStats from './delegateStats'

describe('delegateStats', () => {
  const A = 'A' as Address
  const B = 'B' as Address
  const C = 'C' as Address

  test('it works', () => {
    const weights = {
      [B]: {
        [A]: 50n,
      },
      [C]: {
        [A]: 50n,
      },
    }
    const power = {
      [B]: {
        [A]: 20,
      },
      [C]: {
        [A]: 20,
      },
    }
    const scores = {
      [A]: 40,
      [B]: 10,
      [C]: 50,
    }

    const result = delegateStats({
      totalSupply: 100,
      delegateWeights: weights,
      delegatePower: power,
      scores,
    })

    // TODO expand these tests
    expect(result).toEqual([
      {
        address: B,
        delegatorCount: 1,
        votingPower: 30,
        percentOfDelegators: 10000,
        percentOfVotingPower: 3000,
      },
      {
        address: C,
        delegatorCount: 1,
        votingPower: 70,
        percentOfDelegators: 10000,
        percentOfVotingPower: 7000,
      },
    ])
  })
})
