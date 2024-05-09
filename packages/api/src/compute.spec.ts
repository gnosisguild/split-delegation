import { describe, test } from '@jest/globals'
import { Address } from 'viem'

import compute from './compute'

describe('compute', () => {
  const A = 'A' as Address
  const B = 'B' as Address
  const C = 'C' as Address
  const D = 'D' as Address

  test('it works when all requested nodes present in delegation graph', () => {
    const weights = {
      [A]: {
        [B]: 20n,
        [C]: 80n,
      },
      [B]: {
        [D]: 100n,
      },
    }
    const scores = {
      [A]: 1000,
      [B]: 100,
      [C]: 20,
      [D]: 30,
    }
    expect(compute({ weights, scores })).toEqual({
      votingPower: {
        [A]: 0,
        [B]: 0,
        [C]: 800 + 20,
        [D]: 300 + 30,
      },
      delegatorCount: {
        all: 2,
        [A]: 0,
        [B]: 1,
        [C]: 1,
        [D]: 2,
      },
    })
  })

  test('it works with a forward edge', () => {
    const weights = {
      [A]: {
        [B]: 50n,
        [C]: 50n,
      },
      [B]: {
        [D]: 100n,
      },
      [C]: {
        [D]: 100n,
      },
    }
    const scores = {
      [A]: 1000,
      [B]: 1000,
      [C]: 1000,
      [D]: 500,
    }

    expect(compute({ weights, scores })).toEqual({
      votingPower: {
        [A]: 0,
        [B]: 0,
        [C]: 0,
        [D]: 3500,
      },
      delegatorCount: {
        all: 3,
        [A]: 0,
        [B]: 1,
        [C]: 1,
        [D]: 3,
      },
    })
  })

  test('it works when some requested nodes not present in delegation graph', () => {
    const weights = {
      [A]: {
        [B]: 20n,
        [C]: 80n,
      },
    }
    const scores = {
      [A]: 1000,
      [B]: 0,
      [C]: 0,
      [D]: 30,
    }
    expect(compute({ weights, scores })).toEqual({
      votingPower: {
        [A]: 0,
        [B]: 200,
        [C]: 800,
        [D]: 30,
      },
      delegatorCount: {
        all: 1,
        [A]: 0,
        [B]: 1,
        [C]: 1,
        [D]: 0,
      },
    })
  })

  test('it works with an empty delegation graph', () => {
    const weights = {}
    const scores = {
      [A]: 50,
      [B]: 60,
    }
    expect(compute({ weights, scores })).toEqual({
      votingPower: {
        [A]: 50,
        [B]: 60,
      },
      delegatorCount: {
        all: 0,
        [A]: 0,
        [B]: 0,
      },
    })
  })
  test('it handles delegator graph entry with no edges', () => {
    const weights = {
      [A]: {
        [B]: 20n,
        [C]: 80n,
      },
      [C]: {},
    }
    const scores = {
      [A]: 100,
      [B]: 0,
      [C]: 0,
      [D]: 0,
    }
    expect(compute({ weights, scores })).toEqual({
      votingPower: {
        [A]: 0,
        [B]: 20,
        [C]: 80,
        [D]: 0,
      },
      delegatorCount: {
        all: 1,
        [A]: 0,
        [B]: 1,
        [C]: 1,
        [D]: 0,
      },
    })
  })
})
