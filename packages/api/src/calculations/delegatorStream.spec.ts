import { describe, test } from '@jest/globals'
import { Address } from 'viem'

import delegatorStream from './delegatorStream'

describe('delegatorStream', () => {
  const A = 'A' as Address
  const B = 'B' as Address
  const C = 'C' as Address
  const D = 'D' as Address
  const E = 'E' as Address

  test('node without delegations', () => {
    const weights = {}
    expect(delegatorStream({ weights, scores: {}, toDelegate: A })).toEqual([])
  })

  test('direct delegation', () => {
    const weights = {
      [A]: {
        [C]: 100n,
      },
      [B]: {
        [C]: 100n,
      },
    }

    const scores = {
      [A]: 123,
      [B]: 456,
      [C]: 0,
    }

    expect(delegatorStream({ weights, scores, toDelegate: C })).toEqual([
      {
        address: A,
        direct: true,
        delegatedPower: 123,
      },
      {
        address: B,
        direct: true,
        delegatedPower: 456,
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

    const scores = { [A]: 10, [B]: 20, [C]: 30, [D]: 40, [E]: 50 }

    expect(delegatorStream({ weights, scores, toDelegate: A })).toEqual([])

    expect(delegatorStream({ weights, scores, toDelegate: B })).toEqual([
      {
        address: A,
        direct: true,
        delegatedPower: 5,
      },
    ])

    expect(delegatorStream({ weights, scores, toDelegate: C })).toEqual([
      {
        address: A,
        direct: true,
        delegatedPower: 5,
      },
    ])

    expect(delegatorStream({ weights, scores, toDelegate: D })).toEqual([
      {
        address: A,
        direct: false,
        delegatedPower: 2.5,
      },
      {
        address: B,
        direct: true,
        delegatedPower: 10,
      },
    ])

    expect(delegatorStream({ weights, scores, toDelegate: E })).toEqual([
      {
        address: A,
        direct: false,
        delegatedPower: 2.5,
      },
      {
        address: B,
        direct: true,
        delegatedPower: 10,
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

    const scores = {
      [A]: 1000,
      [B]: 10,
      [C]: 20,
      [D]: 30,
      [E]: 40,
    }

    expect(delegatorStream({ weights, scores, toDelegate: A })).toEqual([])

    expect(delegatorStream({ weights, scores, toDelegate: B })).toEqual([
      {
        address: A,
        direct: true,
        delegatedPower: 300,
      },
    ])

    expect(delegatorStream({ weights, scores, toDelegate: C })).toEqual([
      {
        address: A,
        direct: true,
        delegatedPower: 700,
      },
    ])

    expect(delegatorStream({ weights, scores, toDelegate: D })).toEqual([
      {
        address: A,
        direct: false,
        delegatedPower: 1000,
      },
      {
        address: B,
        direct: true,
        delegatedPower: 10,
      },
      {
        address: C,
        direct: true,
        delegatedPower: 20,
      },
    ])

    expect(delegatorStream({ weights, scores, toDelegate: E })).toEqual([
      {
        address: A,
        direct: false,
        delegatedPower: 1000,
      },
      {
        address: B,
        direct: false,
        delegatedPower: 10,
      },
      {
        address: C,
        direct: false,
        delegatedPower: 20,
      },
      {
        address: D,
        direct: true,
        delegatedPower: 30,
      },
    ])
  })
})
