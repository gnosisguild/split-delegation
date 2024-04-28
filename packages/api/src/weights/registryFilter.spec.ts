import { describe, test } from '@jest/globals'
import { Address } from 'viem'

import { Registry } from './types'
import { filterExpired, filterOptOuts } from './registryFilter'

describe('filterRegistry', () => {
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

    const result = filterExpired(registry, 2024)

    expect(result).toEqual({
      [A]: {
        delegation: [],
        expiration: 2023,
        optOut: false,
      },
      [B]: {
        delegation: [{ delegate: C, ratio: 200n }],
        expiration: 2030,
        optOut: false,
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

    const result = filterOptOuts(registry)

    expect(result).toEqual({
      [A]: {
        delegation: [{ delegate: C, ratio: 50n }],
        expiration: 2023,
        optOut: false,
      },
      [B]: {
        delegation: [{ delegate: C, ratio: 200n }],
        expiration: 2030,
        optOut: true,
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

    const result = filterExpired(filterOptOuts(registry), 2024)

    expect(result).toEqual({
      [A]: {
        delegation: [{ delegate: C, ratio: 50n }],
        expiration: 0,
        optOut: false,
      },
      [B]: {
        delegation: [],
        expiration: 1999,
        optOut: true,
      },
    })
  })
})
