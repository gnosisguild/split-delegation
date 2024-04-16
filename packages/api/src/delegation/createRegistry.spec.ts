import { describe, test } from '@jest/globals'
import { DelegationEvent } from 'src/types'
import { Address } from 'viem'
import reduceRegistry from './createRegistry'

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
    const result = reduceRegistry(events)

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
        opt: {
          optOut: true,
        },
      },
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
        clear: {
          delegation: [],
          expiration: 0,
        },
      },
    ]
    const result = reduceRegistry(events)

    expect(result).toEqual({
      [A]: {
        delegation: [],
        expiration: 0,
        optOut: true,
      },
    })
  })

  test('NOOP: clearing out on a different network', () => {
    const events: DelegationEvent[] = [
      {
        chainId: 100,
        registry: REGISTRY_V1,
        space: 'test',
        account: A,
        set: {
          delegation: [{ delegate: B, ratio: 123n }],
          expiration: 123,
        },
      },
      {
        chainId: 1,
        registry: REGISTRY_V1,
        space: 'test',
        account: A,
        set: {
          delegation: [{ delegate: B, ratio: 345n }],
          expiration: 567,
        },
      },
      {
        chainId: 100,
        registry: REGISTRY_V1,
        space: 'test',
        account: A,
        clear: { delegation: [], expiration: 0 },
      },
    ]

    expect(reduceRegistry(events)).toEqual({
      [A]: {
        delegation: [{ delegate: B, ratio: 345n }],
        expiration: 567,
        optOut: false,
      },
    })
  })

  test('NOOP: clearing out on a different registry', () => {
    const events: DelegationEvent[] = [
      {
        chainId: 1,
        registry: REGISTRY_V1,
        space: 'test',
        account: A,
        set: {
          delegation: [{ delegate: B, ratio: 345n }],
          expiration: 567,
        },
      },
      {
        chainId: 1,
        registry: REGISTRY_V2,
        space: 'test',
        account: A,
        clear: { delegation: [], expiration: 0 },
      },
    ]

    expect(reduceRegistry(events)).toEqual({
      [A]: {
        delegation: [{ delegate: B, ratio: 345n }],
        expiration: 567,
        optOut: false,
      },
    })
  })

  test('it opts out of being a delegate', () => {
    const events: DelegationEvent[] = [
      {
        chainId: 1,
        registry: REGISTRY_V1,
        space: 'test',
        account: A,
        set: {
          delegation: [
            { delegate: B, ratio: 3n },
            { delegate: C, ratio: 4n },
          ],
          expiration: 0,
        },
      },
      {
        chainId: 100,
        registry: REGISTRY_V2,
        space: 'test',
        account: B,
        opt: { optOut: true },
      },
    ]

    expect(reduceRegistry(events)).toEqual({
      [A]: {
        delegation: [
          { delegate: B, ratio: 3n },
          { delegate: C, ratio: 4n },
        ],
        expiration: 0,
        optOut: false,
      },
      [B]: {
        delegation: [],
        expiration: 0,
        optOut: true,
      },
    })
  })

  test('NOOP: opting out on a different venue', () => {
    const events: DelegationEvent[] = [
      {
        chainId: 1,
        registry: REGISTRY_V1,
        space: 'test',
        account: A,
        set: {
          delegation: [
            { delegate: B, ratio: 3n },
            { delegate: C, ratio: 4n },
          ],
          expiration: 0,
        },
      },
      {
        chainId: 100,
        registry: REGISTRY_V1,
        space: 'test',
        account: A,
        opt: { optOut: true },
      },
    ]

    expect(reduceRegistry(events)).toEqual({
      [A]: {
        delegation: [
          { delegate: B, ratio: 3n },
          { delegate: C, ratio: 4n },
        ],
        expiration: 0,
        optOut: false,
      },
    })
  })

  test('it sets expiration for a delegation', () => {
    const events: DelegationEvent[] = [
      {
        chainId: 1,
        registry: REGISTRY_V1,
        space: 'test',
        account: A,
        expire: {
          expiration: 123,
        },
      },
    ]

    expect(reduceRegistry(events)).toEqual({
      [A]: {
        delegation: [],
        expiration: 123,
        optOut: false,
      },
    })
  })

  test('setting expiration preserves delegates', () => {
    const events: DelegationEvent[] = [
      {
        chainId: 1,
        registry: REGISTRY_V1,
        space: 'test',
        account: A,
        set: {
          delegation: [
            { delegate: B, ratio: 3n },
            { delegate: C, ratio: 4n },
          ],
          expiration: 123,
        },
      },
      {
        chainId: 1,
        registry: REGISTRY_V1,
        space: 'test',
        account: A,
        expire: { expiration: 456 },
      },
    ]

    expect(reduceRegistry(events)).toEqual({
      [A]: {
        delegation: [
          { delegate: B, ratio: 3n },
          { delegate: C, ratio: 4n },
        ],
        expiration: 456,
        optOut: false,
      },
    })
  })

  test('NOOP: setting expiration for a delegation on a different venue', () => {
    const events: DelegationEvent[] = [
      {
        chainId: 1,
        registry: REGISTRY_V1,
        space: 'test',
        account: A,
        set: {
          delegation: [
            { delegate: B, ratio: 3n },
            { delegate: C, ratio: 4n },
          ],
          expiration: 123,
        },
      },
      {
        chainId: 100,
        registry: REGISTRY_V1,
        space: 'test',
        account: A,
        expire: { expiration: 456 },
      },
    ]

    expect(reduceRegistry(events)).toEqual({
      [A]: {
        delegation: [
          { delegate: B, ratio: 3n },
          { delegate: C, ratio: 4n },
        ],
        expiration: 123,
        optOut: false,
      },
    })
  })
})
