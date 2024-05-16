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
        incoming: [],
        outgoing: [{ address: C, direct: true, weight: 100, ratio: 1 }],
      },
      [B]: {
        incoming: [],
        outgoing: [{ address: C, direct: true, weight: 100, ratio: 1 }],
      },
      [C]: {
        incoming: [
          { address: A, direct: true, weight: 100, ratio: 1 },
          { address: B, direct: true, weight: 100, ratio: 1 },
        ],
        outgoing: [],
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
        incoming: [],
        outgoing: [
          { address: B, direct: true, weight: 50, ratio: 0.5 },
          { address: C, direct: true, weight: 50, ratio: 0.5 },
          { address: D, direct: false, weight: 25, ratio: 0.25 },
          { address: E, direct: false, weight: 25, ratio: 0.25 },
        ],
      },
      [B]: {
        incoming: [{ address: A, direct: true, weight: 50, ratio: 0.5 }],
        outgoing: [
          { address: D, direct: true, weight: 50, ratio: 0.5 },
          { address: E, direct: true, weight: 50, ratio: 0.5 },
        ],
      },
      [C]: {
        incoming: [{ address: A, direct: true, weight: 50, ratio: 0.5 }],
        outgoing: [],
      },
      [D]: {
        incoming: [
          { address: A, direct: false, weight: 25, ratio: 0.25 },
          { address: B, direct: true, weight: 50, ratio: 0.5 },
        ],
        outgoing: [],
      },
      [E]: {
        incoming: [
          { address: A, direct: false, weight: 25, ratio: 0.25 },
          { address: B, direct: true, weight: 50, ratio: 0.5 },
        ],
        outgoing: [],
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
        incoming: [],
        outgoing: [
          { address: B, direct: true, weight: 30, ratio: 0.3 },
          { address: C, direct: true, weight: 70, ratio: 0.7 },
          { address: D, direct: false, weight: 100, ratio: 1 },
          { address: E, direct: false, weight: 100, ratio: 1 },
        ],
      },
      [B]: {
        incoming: [{ address: A, direct: true, weight: 30, ratio: 0.3 }],
        outgoing: [
          { address: D, direct: true, weight: 100, ratio: 1 },
          { address: E, direct: false, weight: 100, ratio: 1 },
        ],
      },
      [C]: {
        incoming: [{ address: A, direct: true, weight: 70, ratio: 0.7 }],
        outgoing: [
          { address: D, direct: true, weight: 100, ratio: 1 },
          { address: E, direct: false, weight: 100, ratio: 1 },
        ],
      },
      [D]: {
        incoming: [
          { address: A, direct: false, weight: 100, ratio: 1 },
          { address: B, direct: true, weight: 100, ratio: 1 },
          { address: C, direct: true, weight: 100, ratio: 1 },
        ],
        outgoing: [{ address: E, direct: true, weight: 100, ratio: 1 }],
      },
      [E]: {
        incoming: [
          { address: A, direct: false, weight: 100, ratio: 1 },
          { address: B, direct: false, weight: 100, ratio: 1 },
          { address: C, direct: false, weight: 100, ratio: 1 },
          { address: D, direct: true, weight: 100, ratio: 1 },
        ],
        outgoing: [],
      },
    })
  })
})
