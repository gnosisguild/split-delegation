import { describe, test } from '@jest/globals'
import { Address } from 'viem'

import { DelegationAction } from 'src/types'
import top from './top'

describe('top', () => {
  const A = 'A' as Address
  const B = 'B' as Address
  const C = 'C' as Address
  const D = 'D' as Address
  const E = 'E' as Address

  const REGISTRY_V1 = '0x01' as Address

  test('it outputs top delegates by count', () => {
    const actions: DelegationAction[] = [
      {
        account: A,
        chainId: 1,
        registry: REGISTRY_V1,
        set: {
          delegation: [{ delegate: D, ratio: 100n }],
          expiration: 0,
        },
      },
      {
        account: B,
        chainId: 1,
        registry: REGISTRY_V1,
        set: {
          delegation: [{ delegate: E, ratio: 100n }],
          expiration: 0,
        },
      },
      {
        account: C,
        chainId: 1,
        registry: REGISTRY_V1,
        set: {
          delegation: [{ delegate: E, ratio: 100n }],
          expiration: 0,
        },
      },
    ]

    const result = top(actions, 2024, {
      offset: 0,
      limit: 10,
      orderBy: 'count',
    })

    expect(result).toEqual([
      {
        address: E,
        delegatorCount: 2,
      },
      {
        address: D,
        delegatorCount: 1,
      },
    ])
  })

  test.skip('it outputs top delegates by weight', () => {})

  test('it observes limit', () => {
    const actions: DelegationAction[] = [
      {
        account: A,
        chainId: 1,
        registry: REGISTRY_V1,
        set: {
          delegation: [{ delegate: D, ratio: 100n }],
          expiration: 0,
        },
      },
      {
        account: B,
        chainId: 1,
        registry: REGISTRY_V1,
        set: {
          delegation: [{ delegate: E, ratio: 100n }],
          expiration: 0,
        },
      },
      {
        account: C,
        chainId: 1,
        registry: REGISTRY_V1,
        set: {
          delegation: [{ delegate: E, ratio: 100n }],
          expiration: 0,
        },
      },
    ]

    const result = top(actions, 2024, {
      offset: 0,
      limit: 1,
      orderBy: 'count',
    })

    expect(result).toEqual([
      {
        address: E,
        delegatorCount: 2,
      },
    ])
  })

  test('it observes offset', () => {
    const actions: DelegationAction[] = [
      {
        account: A,
        chainId: 1,
        registry: REGISTRY_V1,
        set: {
          delegation: [{ delegate: D, ratio: 100n }],
          expiration: 0,
        },
      },
      {
        account: B,
        chainId: 1,
        registry: REGISTRY_V1,
        set: {
          delegation: [{ delegate: E, ratio: 100n }],
          expiration: 0,
        },
      },
      {
        account: C,
        chainId: 1,
        registry: REGISTRY_V1,
        set: {
          delegation: [{ delegate: E, ratio: 100n }],
          expiration: 0,
        },
      },
    ]

    const result = top(actions, 2024, {
      offset: 1,
      limit: 10,
      orderBy: 'count',
    })

    expect(result).toEqual([
      {
        address: D,
        delegatorCount: 1,
      },
    ])
  })
})
