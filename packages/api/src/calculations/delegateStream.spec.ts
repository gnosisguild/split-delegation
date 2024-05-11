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
    expect(delegateStream(weights, A, 1000)).toEqual([])
  })

  test('direct delegation', () => {
    const weights = {
      [A]: {
        [B]: 20n,
        [C]: 30n,
        [D]: 50n,
      },
    }

    expect(delegateStream(weights, A, 1000)).toEqual([
      {
        address: B,
        delegatedPower: 200,
        breakdown: { transient: 0, direct: 200 },
      },
      {
        address: C,
        delegatedPower: 300,
        breakdown: { transient: 0, direct: 300 },
      },
      {
        address: D,
        delegatedPower: 500,
        breakdown: { transient: 0, direct: 500 },
      },
    ])
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
    expect(delegateStream(weights, A, 1000)).toEqual([
      {
        address: B,
        delegatedPower: 0,
        breakdown: { transient: 500, direct: 500 },
      },
      {
        address: C,
        delegatedPower: 500,
        breakdown: { transient: 0, direct: 500 },
      },
      {
        address: D,
        delegatedPower: 250,
        breakdown: { transient: 0, direct: 0 },
      },
      {
        address: E,
        delegatedPower: 250,
        breakdown: { transient: 0, direct: 0 },
      },
    ])
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

    expect(delegateStream(weights, A, 1000)).toEqual([
      {
        address: B,
        delegatedPower: 0,
        breakdown: { transient: 300, direct: 300 },
      },
      {
        address: C,
        delegatedPower: 0,
        breakdown: { transient: 700, direct: 700 },
      },
      {
        address: D,
        delegatedPower: 0,
        breakdown: { transient: 1000, direct: 0 },
      },
      {
        address: E,
        delegatedPower: 1000,
        breakdown: { transient: 0, direct: 0 },
      },
    ])
  })
})
