import { describe, test } from '@jest/globals'
import { Address } from 'viem'

import delegations from './delegations'

describe('delegations', () => {
  const A = 'A' as Address
  const B = 'B' as Address
  const C = 'C' as Address
  const D = 'D' as Address
  const E = 'E' as Address

  test('node without delegations', () => {
    const weights = {}
    expect(delegations({ weights })).toEqual({})
  })

  test('direct delegation', () => {
    const weights = {
      [A]: {
        [C]: 100n,
      },
      [B]: {
        [C]: 100n,
      },
    }

    expect(delegations({ weights })).toEqual({
      [A]: {
        delegators: [],
        delegates: [{ address: C, weight: 100n }],
      },
      [B]: {
        delegators: [],
        delegates: [{ address: C, weight: 100n }],
      },
      [C]: {
        delegators: [
          { address: A, weight: 100n },
          { address: B, weight: 100n },
        ],
        delegates: [],
      },
    })
  })

  test('transitive delegation', () => {
    const weights = {
      [A]: {
        [B]: 50n,
        [C]: 50n,
      },
      [B]: {
        [D]: 50n,
        [E]: 50n,
      },
    }

    expect(delegations({ weights })).toEqual({
      [A]: {
        delegators: [],
        delegates: [
          { address: B, weight: 50n },
          { address: C, weight: 50n },
          { address: D, weight: 25n },
          { address: E, weight: 25n },
        ],
      },
      [B]: {
        delegators: [{ address: A, weight: 50n }],
        delegates: [
          { address: D, weight: 50n },
          { address: E, weight: 50n },
        ],
      },
      [C]: { delegators: [{ address: A, weight: 50n }], delegates: [] },
      [D]: {
        delegators: [
          { address: A, weight: 25n },
          { address: B, weight: 50n },
        ],
        delegates: [],
      },
      [E]: {
        delegators: [
          { address: A, weight: 25n },
          { address: B, weight: 50n },
        ],
        delegates: [],
      },
    })
  })

  test('transitive delegation with a forward edge', () => {
    const weights = {
      [A]: {
        [B]: 30n,
        [C]: 70n,
      },
      [B]: {
        [D]: 100n,
      },
      [C]: {
        [D]: 100n,
      },
      [D]: {
        [E]: 100n,
      },
    }

    expect(delegations({ weights })).toEqual({
      [A]: {
        delegators: [],
        delegates: [
          { address: B, weight: 30n },
          { address: C, weight: 70n },
          { address: D, weight: 100n },
          { address: E, weight: 100n },
        ],
      },
      [B]: {
        delegators: [{ address: A, weight: 30n }],
        delegates: [
          { address: D, weight: 100n },
          { address: E, weight: 100n },
        ],
      },
      [C]: {
        delegators: [{ address: A, weight: 70n }],
        delegates: [
          { address: D, weight: 100n },
          { address: E, weight: 100n },
        ],
      },
      [D]: {
        delegators: [
          { address: A, weight: 100n },
          { address: B, weight: 100n },
          { address: C, weight: 100n },
        ],
        delegates: [{ address: E, weight: 100n }],
      },
      [E]: {
        delegators: [
          { address: A, weight: 100n },
          { address: B, weight: 100n },
          { address: C, weight: 100n },
          { address: D, weight: 100n },
        ],
        delegates: [],
      },
    })
  })
})
