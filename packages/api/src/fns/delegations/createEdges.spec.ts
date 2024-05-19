import { describe, test } from '@jest/globals'
import { Address } from 'viem'

import createEdges from './createEdges'

describe('createEdges', () => {
  const A = 'A' as Address
  const B = 'B' as Address
  const C = 'C' as Address

  test('it sets a delegation', () => {
    const registry = {
      [A]: {
        delegation: [{ delegate: B, weight: 100 }],
        expiration: 0,
        optOut: false,
      },
    }
    const result = createEdges(registry, 0)

    expect(result).toEqual([{ delegator: A, delegate: B, weight: 100 }])
  })

  test('it sets a delegation with a self-referencing edge', () => {
    const registry = {
      [A]: {
        delegation: [
          { delegate: A, weight: 20 },
          { delegate: B, weight: 80 },
        ],
        expiration: 0,
        optOut: false,
      },
    }
    const result = createEdges(registry, 0)

    expect(result).toEqual([
      { delegator: A, delegate: A, weight: 20 },
      { delegator: A, delegate: B, weight: 80 },
    ])
  })

  test('it opts out of being a delegate', () => {
    const registry = {
      [A]: {
        delegation: [
          { delegate: B, weight: 50 },
          { delegate: C, weight: 50 },
        ],
        expiration: 0,
        optOut: false,
      },
      [C]: {
        delegation: [],
        expiration: 0,
        optOut: true,
      },
    }
    const result = createEdges(registry, 0)

    expect(result).toEqual([{ delegator: A, delegate: B, weight: 50 }])
  })

  test('it sets expiration for a delegation', () => {
    const registry = {
      [A]: {
        delegation: [
          { delegate: B, weight: 50 },
          { delegate: C, weight: 50 },
        ],
        expiration: 1999,
        optOut: false,
      },
      [B]: {
        delegation: [{ delegate: C, weight: 100 }],
        expiration: 2025,
        optOut: false,
      },
    }
    const result = createEdges(registry, 2024)

    expect(result).toEqual([{ delegator: B, delegate: C, weight: 100 }])
  })

  test('it still opts out, even when expiration set for delegation', () => {
    const registry = {
      [A]: {
        delegation: [
          { delegate: B, weight: 50 },
          { delegate: C, weight: 50 },
        ],
        expiration: 0,
        optOut: false,
      },
      [B]: {
        delegation: [{ delegate: C, weight: 100 }],
        expiration: 1999,
        optOut: true,
      },
    }
    const result = createEdges(registry, 2024)

    expect(result).toEqual([{ delegator: A, delegate: C, weight: 50 }])
  })

  test('it does not output empty delegator node', () => {
    const registry = {
      [A]: {
        delegation: [],
        expiration: 0,
        optOut: false,
      },
      [B]: {
        delegation: [{ delegate: C, weight: 100 }],
        expiration: 0,
        optOut: true,
      },
    }
    const result = createEdges(registry, 2024)

    expect(result).toEqual([{ delegator: B, delegate: C, weight: 100 }])
  })
})
