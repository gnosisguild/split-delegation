import { describe, test } from '@jest/globals'
import { Address } from 'viem'

import calculateDelegations from './delegations'

describe('calculateDelegations', () => {
  const A = 'A' as Address
  const B = 'B' as Address
  const C = 'C' as Address
  const D = 'D' as Address
  const E = 'E' as Address

  test('node without delegations', () => {
    const weights = {}
    expect(calculateDelegations({ weights })).toEqual({})
  })

  test('direct delegation', () => {
    const weights = {
      [A]: {
        [C]: 100,
      },
      [B]: {
        [C]: 100,
      },
    }

    expect(calculateDelegations({ weights })).toEqual({
      [A]: {
        delegators: [],
        delegates: [{ address: C, weight: 100 }],
      },
      [B]: {
        delegators: [],
        delegates: [{ address: C, weight: 100 }],
      },
      [C]: {
        delegators: [
          { address: A, weight: 100 },
          { address: B, weight: 100 },
        ],
        delegates: [],
      },
    })
  })

  test('transitive delegation', () => {
    const weights = {
      [A]: {
        [B]: 50,
        [C]: 50,
      },
      [B]: {
        [D]: 50,
        [E]: 50,
      },
    }

    expect(calculateDelegations({ weights })).toEqual({
      [A]: {
        delegators: [],
        delegates: [
          { address: B, weight: 50 },
          { address: C, weight: 50 },
          { address: D, weight: 25 },
          { address: E, weight: 25 },
        ],
      },
      [B]: {
        delegators: [{ address: A, weight: 50 }],
        delegates: [
          { address: D, weight: 50 },
          { address: E, weight: 50 },
        ],
      },
      [C]: { delegators: [{ address: A, weight: 50 }], delegates: [] },
      [D]: {
        delegators: [
          { address: A, weight: 25 },
          { address: B, weight: 50 },
        ],
        delegates: [],
      },
      [E]: {
        delegators: [
          { address: A, weight: 25 },
          { address: B, weight: 50 },
        ],
        delegates: [],
      },
    })
  })

  test('transitive delegation with a forward edge', () => {
    const weights = {
      [A]: {
        [B]: 30,
        [C]: 70,
      },
      [B]: {
        [D]: 100,
      },
      [C]: {
        [D]: 100,
      },
      [D]: {
        [E]: 100,
      },
    }

    expect(calculateDelegations({ weights })).toEqual({
      [A]: {
        delegators: [],
        delegates: [
          { address: B, weight: 30 },
          { address: C, weight: 70 },
          { address: D, weight: 100 },
          { address: E, weight: 100 },
        ],
      },
      [B]: {
        delegators: [{ address: A, weight: 30 }],
        delegates: [
          { address: D, weight: 100 },
          { address: E, weight: 100 },
        ],
      },
      [C]: {
        delegators: [{ address: A, weight: 70 }],
        delegates: [
          { address: D, weight: 100 },
          { address: E, weight: 100 },
        ],
      },
      [D]: {
        delegators: [
          { address: A, weight: 100 },
          { address: B, weight: 100 },
          { address: C, weight: 100 },
        ],
        delegates: [{ address: E, weight: 100 }],
      },
      [E]: {
        delegators: [
          { address: A, weight: 100 },
          { address: B, weight: 100 },
          { address: C, weight: 100 },
          { address: D, weight: 100 },
        ],
        delegates: [],
      },
    })
  })
})
