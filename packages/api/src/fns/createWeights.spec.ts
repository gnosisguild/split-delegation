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
        delegation: [{ delegate: B, ratio: 100n }],
        expiration: 0,
        optOut: false,
      },
    }
    const result = createWeights(registry, 0)

    expect(result).toEqual({
      [A]: {
        [B]: 100n,
      },
    })
  })

  test('it opts out of being a delegate', () => {
    const registry = {
      [A]: {
        delegation: [
          { delegate: B, ratio: 50n },
          { delegate: C, ratio: 50n },
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
        [B]: 50n,
      },
    })
  })

  test('it sets expiration for a delegation', () => {
    const registry = {
      [A]: {
        delegation: [
          { delegate: B, ratio: 50n },
          { delegate: C, ratio: 50n },
        ],
        expiration: 1999,
        optOut: false,
      },
      [B]: {
        delegation: [{ delegate: C, ratio: 100n }],
        expiration: 2025,
        optOut: false,
      },
    }
    const result = createWeights(registry, 2024)

    expect(result).toEqual({
      [B]: {
        [C]: 100n,
      },
    })
  })

  test('it still opts out, even when expiration set for delegation', () => {
    const registry = {
      [A]: {
        delegation: [
          { delegate: B, ratio: 50n },
          { delegate: C, ratio: 50n },
        ],
        expiration: 0,
        optOut: false,
      },
      [B]: {
        delegation: [{ delegate: C, ratio: 100n }],
        expiration: 1999,
        optOut: true,
      },
    }
    const result = createWeights(registry, 2024)

    expect(result).toEqual({
      [A]: {
        [C]: 50n,
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
        delegation: [{ delegate: C, ratio: 100n }],
        expiration: 0,
        optOut: true,
      },
    }
    const result = createWeights(registry, 2024)

    expect(result).toEqual({
      [B]: {
        [C]: 100n,
      },
    })
  })
})
