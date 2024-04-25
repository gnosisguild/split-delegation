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
        [A]: 70n,
      },
      [C]: {
        [A]: 30n,
      },
    }
    const scores = {
      [B]: 140,
      [C]: 60,
    }

    const result = delegateStats({
      delegateWeights: weights,
      delegateScores: scores,
    })

    // TODO expand these tests
    expect(result).toEqual([
      {
        address: B,
        delegatorCount: 1,
        votingPower: 140,
        percentOfDelegators: 5000,
        percentOfVotingPower: 7000,
      },
      {
        address: C,
        delegatorCount: 1,
        votingPower: 60,
        percentOfDelegators: 5000,
        percentOfVotingPower: 3000,
      },
    ])
  })
})
