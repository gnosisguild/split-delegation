import { describe, test } from '@jest/globals'
import { DelegationEvent } from 'src/types'
import { Address } from 'viem'
import reduceRegistry from './reduceRegistry'

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
  const D = 'D' as Address

  const REGISTRY_V1 = '0x01' as Address
  const REGISTRY_V2 = '0x02' as Address

  test('it sets a delegation', () => {
    const events: DelegationEvent[] = [
      {
        account: A,
        chainId: 1,
        registry: REGISTRY_V1,
        space: 'test',
        set: {
          delegation: [{ delegate: B, ratio: 100n }],
          expiration: 0,
        },
      },
    ]
    const result = reduceRegistry(events, 100)

    expect(result).toEqual({
      [A]: {
        delegation: [{ delegate: B, ratio: 100n }],
        expiration: 0,
        optOut: false,
      },
    })
  })

  test('it clears a delegation', () => {
    const events: DelegationEvent[] = [
      {
        chainId: 1,
        registry: REGISTRY_V1,
        space: 'test',
        account: A,
        set: {
          delegation: [{ delegate: B, ratio: 100n }],
          expiration: 100,
        },
      },
      {
        chainId: 1,
        registry: REGISTRY_V1,
        space: 'test',
        account: A,
        clear: {},
      },
    ]
    const result = reduceRegistry(events, 9999999)

    expect(result).toEqual({
      [A]: {
        delegation: [],
        expiration: 0,
        optOut: false,
      },
    })
  })

  test('it opts out of being a delegate', () => {})

  test('it expires a delegate', () => {})

  test('clearing out on a different venue, does not change effectiveness', () => {})

  test('opting out on a different venue, does not change effectiveness', () => {})

  test('expiring out on a different venue, does not change effectiveness', () => {})
})
