import { describe, test } from '@jest/globals'
import { Address } from 'viem'

import calculateVotingPower from './votingPower'
import kahn from '../fns/graph/sort'

describe('votingPower', () => {
  const A = 'A' as Address
  const B = 'B' as Address
  const C = 'C' as Address
  const D = 'D' as Address

  test('it works when all requested nodes present in delegation graph', () => {
    const weights = {
      [A]: {
        [B]: 20,
        [C]: 80,
      },
      [B]: {
        [D]: 100,
      },
    }
    const scores = {
      [A]: 1000,
      [B]: 100,
      [C]: 20,
      [D]: 30,
    }
    expect(
      calculateVotingPower({ weights, scores, order: kahn(weights) })
    ).toEqual({
      [A]: 0,
      [B]: 0,
      [C]: 800 + 20,
      [D]: 300 + 30,
    })
  })

  test('it works with a forward edge', () => {
    const weights = {
      [A]: {
        [B]: 50,
        [C]: 50,
      },
      [B]: {
        [D]: 100,
      },
      [C]: {
        [D]: 100,
      },
    }
    const scores = {
      [A]: 1000,
      [B]: 1000,
      [C]: 1000,
      [D]: 500,
    }

    expect(
      calculateVotingPower({ weights, scores, order: kahn(weights) })
    ).toEqual({
      [A]: 0,
      [B]: 0,
      [C]: 0,
      [D]: 3500,
    })
  })

  test('it works when some requested nodes not present in delegation graph', () => {
    const weights = {
      [A]: {
        [B]: 20,
        [C]: 80,
      },
    }
    const scores = {
      [A]: 1000,
      [B]: 0,
      [C]: 0,
      [D]: 30,
    }
    expect(
      calculateVotingPower({ weights, scores, order: kahn(weights) })
    ).toEqual({
      [A]: 0,
      [B]: 200,
      [C]: 800,
      [D]: 30,
    })
  })

  test('it works with an empty delegation graph', () => {
    const weights = {}
    const scores = {
      [A]: 50,
      [B]: 60,
    }
    expect(
      calculateVotingPower({ weights, scores, order: kahn(weights) })
    ).toEqual({
      [A]: 50,
      [B]: 60,
    })
  })
})
