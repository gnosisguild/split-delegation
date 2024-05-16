import { describe, test } from '@jest/globals'
import { Address } from 'viem'

import createWeights from './createWeights'

describe('createWeights', () => {
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
    const result = createWeights(registry, 0)

    expect(result).toEqual({
      [A]: {
        [B]: 100,
      },
    })
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
    const result = createWeights(registry, 0)

    expect(result).toEqual({
      [A]: {
        [B]: 50,
      },
    })
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
    const result = createWeights(registry, 2024)

    expect(result).toEqual({
      [B]: {
        [C]: 100,
      },
    })
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
    const result = createWeights(registry, 2024)

    expect(result).toEqual({
      [A]: {
        [C]: 50,
      },
    })
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
    const result = createWeights(registry, 2024)

    expect(result).toEqual({
      [B]: {
        [C]: 100,
      },
    })
  })
})
