import { describe, test } from '@jest/globals'
import { Address } from 'viem'

import extractExpiration from './expiration'

describe('expiration', () => {
  const A = 'A' as Address
  const B = 'B' as Address
  const C = 'C' as Address
  const D = 'D' as Address
  const E = 'E' as Address

  test('it returns zero for a missing delegator', () => {
    expect(extractExpiration({ delegations: {}, delegator: D })).toEqual(0)
  })

  test('it returns zero for a delegator with zero delegations', () => {
    const delegations = {
      [A]: {},
      [B]: {
        [E]: { weight: 100, expiration: 2 },
      },
    }

    expect(extractExpiration({ delegations, delegator: A })).toEqual(0)
  })

  test('it returns expiration for a delegator with one delegation', () => {
    const delegations = {
      [A]: {
        [B]: { weight: 50, expiration: 123 },
      },
    }

    expect(extractExpiration({ delegations, delegator: A })).toEqual(123)
  })

  test('it returns expiration for a delegator many delegations', () => {
    const delegations = {
      [A]: {
        [B]: { weight: 50, expiration: 456 },
        [C]: { weight: 50, expiration: 456 },
        [D]: { weight: 50, expiration: 456 },
        [E]: { weight: 50, expiration: 456 },
      },
    }

    expect(extractExpiration({ delegations, delegator: A })).toEqual(456)
  })

  test('it throws when expirations breaks invariant', () => {
    const delegations = {
      [A]: {
        [B]: { weight: 50, expiration: 123 },
        [C]: { weight: 50, expiration: 456 },
      },
    }

    expect(() => extractExpiration({ delegations, delegator: A })).toThrow()
  })
})
