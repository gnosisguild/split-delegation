import { describe, test } from '@jest/globals'
import { Address } from 'viem'

import delegateStream from './delegateStream'

describe('delegateStream', () => {
  const A = 'A' as Address
  const B = 'B' as Address
  const C = 'C' as Address
  const D = 'D' as Address
  const E = 'E' as Address

  test('node without delegations', () => {
    const weights = {}
    expect(delegateStream({ weights, fromDelegator: A, score: 1000 })).toEqual(
      []
    )
  })

  test('direct delegation', () => {
    const weights = {
      [A]: {
        [B]: 20n,
        [C]: 30n,
        [D]: 50n,
      },
    }

    expect(delegateStream({ weights, fromDelegator: A, score: 1000 })).toEqual([
      {
        address: B,
        direct: true,
        delegatedPower: 200,
      },
      {
        address: C,
        direct: true,
        delegatedPower: 300,
      },
      {
        address: D,
        direct: true,
        delegatedPower: 500,
      },
    ])

    expect(delegateStream({ weights, fromDelegator: B, score: 20 })).toEqual([])
  })

  test('transitive delegation', () => {
    const weights = {
      [A]: {
        [B]: 50n,
        [C]: 50n,
      },
      [B]: {
        [D]: 50n,
        [E]: 50n,
      },
    }
    expect(delegateStream({ weights, fromDelegator: A, score: 30 })).toEqual([
      {
        address: B,
        direct: true,
        delegatedPower: 0,
      },
      {
        address: C,
        direct: true,
        delegatedPower: 15,
      },
      {
        address: D,
        direct: false,
        delegatedPower: 7.5,
      },
      {
        address: E,
        direct: false,
        delegatedPower: 7.5,
      },
    ])

    expect(delegateStream({ weights, fromDelegator: B, score: 100 })).toEqual([
      {
        address: D,
        direct: true,
        delegatedPower: 50,
      },
      {
        address: E,
        direct: true,
        delegatedPower: 50,
      },
    ])

    expect(delegateStream({ weights, fromDelegator: D, score: 100 })).toEqual(
      []
    )
  })

  test('transitive delegation with a forward edge', () => {
    const weights = {
      [A]: {
        [B]: 30n,
        [C]: 70n,
      },
      [B]: {
        [D]: 100n,
      },
      [C]: {
        [D]: 100n,
      },
      [D]: {
        [E]: 100n,
      },
    }

    expect(delegateStream({ weights, fromDelegator: A, score: 1000 })).toEqual([
      {
        address: B,
        direct: true,
        delegatedPower: 0,
      },
      {
        address: C,
        direct: true,
        delegatedPower: 0,
      },
      {
        address: D,
        direct: false,
        delegatedPower: 0,
      },
      {
        address: E,
        direct: false,
        delegatedPower: 1000,
      },
    ])
  })
})
