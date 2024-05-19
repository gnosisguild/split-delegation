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

    expect(
      calculateVotingPower({ weights, rweights, scores, address: A })
    ).toEqual({
      votingPower: 0,
      incomingPower: 0,
      outgoingPower: 1000,
    })

    expect(
      calculateVotingPower({ weights, rweights, scores, address: B })
    ).toEqual({
      votingPower: 0,
      incomingPower: 200,
      outgoingPower: 300,
    })

    expect(
      calculateVotingPower({ weights, rweights, scores, address: C })
    ).toEqual({
      votingPower: 820,
      incomingPower: 800,
      outgoingPower: 0,
    })

    expect(
      calculateVotingPower({ weights, rweights, scores, address: D })
    ).toEqual({
      votingPower: 330,
      incomingPower: 300,
      outgoingPower: 0,
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

    expect(
      calculateVotingPower({ weights, rweights, scores, address: A })
    ).toEqual({
      votingPower: 0,
      incomingPower: 0,
      outgoingPower: 1000,
    })

    expect(
      calculateVotingPower({ weights, rweights, scores, address: B })
    ).toEqual({
      votingPower: 0,
      incomingPower: 500,
      outgoingPower: 1500,
    })

    expect(
      calculateVotingPower({ weights, rweights, scores, address: C })
    ).toEqual({
      votingPower: 0,
      incomingPower: 500,
      outgoingPower: 1500,
    })

    expect(
      calculateVotingPower({ weights, rweights, scores, address: D })
    ).toEqual({
      votingPower: 3500,
      incomingPower: 3000,
      outgoingPower: 0,
    })
  })

  test('it works with a self-referencing edge', () => {
    const weights = {
      [A]: {
        [B]: 50,
        [C]: 50,
      },
      [B]: {
        [B]: 20,
        [D]: 80,
      },
    }
    const scores = {
      [A]: 500,
      [B]: 300,
      [C]: 0,
      [D]: 50,
    }

    const rweights = inverse(weights)

    expect(
      calculateVotingPower({ weights, rweights, scores, address: A })
    ).toEqual({
      votingPower: 0,
      incomingPower: 0,
      outgoingPower: 500,
    })

    expect(
      calculateVotingPower({ weights, rweights, scores, address: B })
    ).toEqual({
      votingPower: 110,
      incomingPower: 250,
      outgoingPower: 440,
    })

    expect(
      calculateVotingPower({ weights, rweights, scores, address: C })
    ).toEqual({
      votingPower: 250,
      incomingPower: 250,
      outgoingPower: 0,
    })

    expect(
      calculateVotingPower({ weights, rweights, scores, address: D })
    ).toEqual({
      votingPower: 490,
      incomingPower: 440,
      outgoingPower: 0,
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

    expect(
      calculateVotingPower({ weights, rweights, scores, address: A })
    ).toEqual({
      votingPower: 0,
      incomingPower: 0,
      outgoingPower: 1000,
    })

    expect(
      calculateVotingPower({ weights, rweights, scores, address: B })
    ).toEqual({
      votingPower: 200,
      incomingPower: 200,
      outgoingPower: 0,
    })

    expect(
      calculateVotingPower({ weights, rweights, scores, address: C })
    ).toEqual({
      votingPower: 800,
      incomingPower: 800,
      outgoingPower: 0,
    })

    expect(
      calculateVotingPower({ weights, rweights, scores, address: D })
    ).toEqual({
      votingPower: 30,
      incomingPower: 0,
      outgoingPower: 0,
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

    expect(
      calculateVotingPower({ weights, rweights, scores, address: A })
    ).toEqual({
      votingPower: 100,
      incomingPower: 0,
      outgoingPower: 0,
    })

    expect(
      calculateVotingPower({ weights, rweights, scores, address: B })
    ).toEqual({
      votingPower: 200,
      incomingPower: 0,
      outgoingPower: 0,
    })

    expect(
      calculateVotingPower({ weights, rweights, scores, address: C })
    ).toEqual({
      votingPower: 300,
      incomingPower: 0,
      outgoingPower: 0,
    })

    expect(
      calculateVotingPower({ weights, rweights, scores, address: D })
    ).toEqual({
      votingPower: 400,
      incomingPower: 0,
      outgoingPower: 0,
    })
  })
})
