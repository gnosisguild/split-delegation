import { describe, test } from '@jest/globals'
import { Address } from 'viem'

import calculateVotingPower from './votingPower'
import inverse from '../fns/graph/inverse'

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
    const rweights = inverse(weights)
    const scores = {
      [A]: 1000,
      [B]: 100,
      [C]: 20,
      [D]: 30,
    }

    expect({
      [A]: calculateVotingPower({ weights, rweights, scores, address: A })
        .votingPower,
      [B]: calculateVotingPower({ weights, rweights, scores, address: B })
        .votingPower,
      [C]: calculateVotingPower({ weights, rweights, scores, address: C })
        .votingPower,
      [D]: calculateVotingPower({ weights, rweights, scores, address: D })
        .votingPower,
    }).toEqual({
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

    const rweights = inverse(weights)

    expect({
      [A]: calculateVotingPower({ weights, rweights, scores, address: A })
        .votingPower,
      [B]: calculateVotingPower({ weights, rweights, scores, address: B })
        .votingPower,
      [C]: calculateVotingPower({ weights, rweights, scores, address: C })
        .votingPower,
      [D]: calculateVotingPower({ weights, rweights, scores, address: D })
        .votingPower,
    }).toEqual({
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
    const rweights = inverse(weights)

    expect({
      [A]: calculateVotingPower({ weights, rweights, scores, address: A })
        .votingPower,
      [B]: calculateVotingPower({ weights, rweights, scores, address: B })
        .votingPower,
      [C]: calculateVotingPower({ weights, rweights, scores, address: C })
        .votingPower,
      [D]: calculateVotingPower({ weights, rweights, scores, address: D })
        .votingPower,
    }).toEqual({
      [A]: 0,
      [B]: 200,
      [C]: 800,
      [D]: 30,
    })
  })

  test('it works with an empty delegation graph', () => {
    const weights = {}
    const scores = {
      [A]: 100,
      [B]: 200,
      [C]: 300,
      [D]: 400,
    }

    const rweights = inverse(weights)

    expect({
      [A]: calculateVotingPower({ weights, rweights, scores, address: A })
        .votingPower,
      [B]: calculateVotingPower({ weights, rweights, scores, address: B })
        .votingPower,
      [C]: calculateVotingPower({ weights, rweights, scores, address: C })
        .votingPower,
      [D]: calculateVotingPower({ weights, rweights, scores, address: D })
        .votingPower,
    }).toEqual({
      [A]: 100,
      [B]: 200,
      [C]: 300,
      [D]: 400,
    })
  })
})
