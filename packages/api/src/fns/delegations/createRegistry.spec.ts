import { describe, test } from '@jest/globals'
import { Address } from 'viem'

import createRegistry from './createRegistry'

import { DelegationAction } from './types'

describe('createRegistry', () => {
  const A = 'A' as Address
  const B = 'B' as Address
  const C = 'C' as Address
  const D = 'D' as Address

  const REGISTRY_V1 = '0x01' as Address
  const REGISTRY_V2 = '0x02' as Address

  test('it sets a delegation', () => {
    const actions: DelegationAction[] = [
      {
        account: A,
        chainId: 1,
        registry: REGISTRY_V1,
        set: {
          delegation: [{ delegate: B, weight: 100 }],
          expiration: 0,
        },
      },
    ]
    const result = createRegistry(actions)

    expect(result).toEqual({
      [A]: {
        delegation: [{ delegate: B, weight: 100 }],
        expiration: 0,
        optOut: false,
      },
    })
  })

  test('it clears a delegation', () => {
    const actions: DelegationAction[] = [
      {
        chainId: 1,
        registry: REGISTRY_V1,
        account: A,
        opt: {
          optOut: true,
        },
      },
      {
        chainId: 1,
        registry: REGISTRY_V1,
        account: A,
        set: {
          delegation: [{ delegate: B, weight: 100 }],
          expiration: 1000,
        },
      },
      {
        chainId: 1,
        registry: REGISTRY_V1,
        account: A,
        clear: {
          delegation: [],
          expiration: 0,
        },
      },
    ]
    const result = createRegistry(actions)

    expect(result).toEqual({
      [A]: {
        delegation: [],
        expiration: 0,
        optOut: true,
      },
    })
  })

  test('NOOP: clearing out on a different network', () => {
    const actions: DelegationAction[] = [
      {
        chainId: 100,
        registry: REGISTRY_V1,
        account: A,
        set: {
          delegation: [{ delegate: B, weight: 123 }],
          expiration: 123,
        },
      },
      {
        chainId: 1,
        registry: REGISTRY_V1,
        account: A,
        set: {
          delegation: [{ delegate: B, weight: 345 }],
          expiration: 567,
        },
      },
      {
        chainId: 100,
        registry: REGISTRY_V1,
        account: A,
        clear: { delegation: [], expiration: 0 },
      },
    ]

    expect(createRegistry(actions)).toEqual({
      [A]: {
        delegation: [{ delegate: B, weight: 345 }],
        expiration: 567,
        optOut: false,
      },
    })
  })

  test('NOOP: clearing out on a different registry', () => {
    const actions: DelegationAction[] = [
      {
        chainId: 1,
        registry: REGISTRY_V1,
        account: A,
        set: {
          delegation: [{ delegate: B, weight: 345 }],
          expiration: 567,
        },
      },
      {
        chainId: 1,
        registry: REGISTRY_V2,
        account: A,
        clear: { delegation: [], expiration: 0 },
      },
    ]

    expect(createRegistry(actions)).toEqual({
      [A]: {
        delegation: [{ delegate: B, weight: 345 }],
        expiration: 567,
        optOut: false,
      },
    })
  })

  test('it opts out of being a delegate', () => {
    const actions: DelegationAction[] = [
      {
        chainId: 1,
        registry: REGISTRY_V1,
        account: A,
        set: {
          delegation: [
            { delegate: B, weight: 3 },
            { delegate: C, weight: 4 },
          ],
          expiration: 0,
        },
      },
      {
        chainId: 100,
        registry: REGISTRY_V2,
        account: B,
        opt: { optOut: true },
      },
    ]

    expect(createRegistry(actions)).toEqual({
      [A]: {
        delegation: [
          { delegate: B, weight: 3 },
          { delegate: C, weight: 4 },
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
    const actions: DelegationAction[] = [
      {
        chainId: 1,
        registry: REGISTRY_V1,
        account: A,
        set: {
          delegation: [
            { delegate: B, weight: 3 },
            { delegate: C, weight: 4 },
          ],
          expiration: 0,
        },
      },
      {
        chainId: 100,
        registry: REGISTRY_V1,
        account: A,
        opt: { optOut: true },
      },
    ]

    expect(createRegistry(actions)).toEqual({
      [A]: {
        delegation: [
          { delegate: B, weight: 3 },
          { delegate: C, weight: 4 },
        ],
        expiration: 0,
        optOut: false,
      },
    })
  })

  test('it sets expiration for a delegation', () => {
    const actions: DelegationAction[] = [
      {
        chainId: 1,
        registry: REGISTRY_V1,
        account: A,
        expire: {
          expiration: 123,
        },
      },
    ]

    expect(createRegistry(actions)).toEqual({
      [A]: {
        delegation: [],
        expiration: 123,
        optOut: false,
      },
    })
  })

  test('setting expiration preserves delegates', () => {
    const actions: DelegationAction[] = [
      {
        chainId: 1,
        registry: REGISTRY_V1,
        account: A,
        set: {
          delegation: [
            { delegate: B, weight: 3 },
            { delegate: C, weight: 4 },
          ],
          expiration: 123,
        },
      },
      {
        chainId: 1,
        registry: REGISTRY_V1,
        account: A,
        expire: { expiration: 456 },
      },
    ]

    expect(createRegistry(actions)).toEqual({
      [A]: {
        delegation: [
          { delegate: B, weight: 3 },
          { delegate: C, weight: 4 },
        ],
        expiration: 456,
        optOut: false,
      },
    })
  })

  test('NOOP: setting expiration for a delegation on a different venue', () => {
    const actions: DelegationAction[] = [
      {
        chainId: 1,
        registry: REGISTRY_V1,
        account: A,
        set: {
          delegation: [
            { delegate: B, weight: 3 },
            { delegate: C, weight: 4 },
          ],
          expiration: 123,
        },
      },
      {
        chainId: 100,
        registry: REGISTRY_V1,
        account: A,
        expire: { expiration: 456 },
      },
    ]

    expect(createRegistry(actions)).toEqual({
      [A]: {
        delegation: [
          { delegate: B, weight: 3 },
          { delegate: C, weight: 4 },
        ],
        expiration: 123,
        optOut: false,
      },
    })
  })

  test('opting out outlasts expirations', () => {
    const actions: DelegationAction[] = [
      {
        chainId: 1,
        registry: REGISTRY_V1,
        account: A,
        set: {
          delegation: [
            { delegate: B, weight: 50 },
            { delegate: C, weight: 50 },
          ],
          expiration: 0,
        },
      },
      {
        chainId: 1,
        registry: REGISTRY_V1,
        account: B,
        set: {
          delegation: [{ delegate: C, weight: 50 }],
          expiration: 1999,
        },
      },
      {
        chainId: 1,
        registry: REGISTRY_V1,
        account: B,
        opt: {
          optOut: true,
        },
      },
    ]

    const result = createRegistry(actions)

    expect(result).toEqual({
      [A]: {
        delegation: [
          { delegate: B, weight: 50 },
          { delegate: C, weight: 50 },
        ],
        expiration: 0,
        optOut: false,
      },
      [B]: {
        delegation: [{ delegate: C, weight: 50 }],
        expiration: 1999,
        optOut: true,
      },
    })
  })
})
