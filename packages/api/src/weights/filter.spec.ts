import { describe, test } from '@jest/globals'
import { Address } from 'viem'

import registryToGraph from './filter'
import { Registry } from './types'

// Allow BigInt to be serialized to JSON
Object.defineProperty(BigInt.prototype, 'toJSON', {
  get() {
    'use strict'
    return () => String(this)
  },
})

describe('reduceRegistry', () => {
  const A = 'A' as Address
  const B = 'B' as Address
  const C = 'C' as Address

  test('expired delegations are not reflected in the graph', () => {
    const registry: Registry = {
      [A]: {
        delegation: [{ delegate: B, ratio: 100n }],
        expiration: 2023,
        optOut: false,
      },
      [B]: {
        delegation: [{ delegate: C, ratio: 200n }],
        expiration: 2030,
        optOut: false,
      },
    }

    const result = registryToGraph(registry, 2024)

    expect(result).toEqual({
      [A]: {},
      [B]: {
        [C]: 200n,
      },
    })
  })

  test('optedout accounts do not figure in edges', () => {
    const registry: Registry = {
      [A]: {
        delegation: [
          { delegate: B, ratio: 50n },
          { delegate: C, ratio: 50n },
        ],
        expiration: 2023,
        optOut: false,
      },
      [B]: {
        delegation: [{ delegate: C, ratio: 200n }],
        expiration: 2030,
        optOut: true,
      },
    }

    const result = registryToGraph(registry, 2024)

    expect(result).toEqual({
      [A]: {},
      [B]: {
        [C]: 200n,
      },
    })
  })

  test('opting out outlasts expirations', () => {
    const registry: Registry = {
      [A]: {
        delegation: [
          { delegate: B, ratio: 50n },
          { delegate: C, ratio: 50n },
        ],
        expiration: 0,
        optOut: false,
      },
      [B]: {
        delegation: [],
        expiration: 1999,
        optOut: true,
      },
    }

    const result = registryToGraph(registry, 2024)

    expect(result).toEqual({
      [A]: {
        [C]: 50n,
      },
      [B]: {},
    })
  })
})
