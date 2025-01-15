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
    const delegations = {
      [A]: {
        [B]: { weight: 20, expiration: 1 },
        [C]: { weight: 80, expiration: 1 },
      },
      [B]: {
        [D]: { weight: 100, expiration: 2 },
      },
    }
    const dags = {
      forward: delegations,
      reverse: inverse(delegations),
    }

    const scores = {
      [A]: 1000,
      [B]: 100,
      [C]: 20,
      [D]: 30,
    }

    expect(calculateVotingPower({ dags, scores, address: A })).toEqual({
      votingPower: 0,
      incomingPower: 0,
      outgoingPower: 1000,
    })

    expect(calculateVotingPower({ dags, scores, address: B })).toEqual({
      votingPower: 0,
      incomingPower: 200,
      outgoingPower: 300,
    })

    expect(calculateVotingPower({ dags, scores, address: C })).toEqual({
      votingPower: 820,
      incomingPower: 800,
      outgoingPower: 0,
    })

    expect(calculateVotingPower({ dags, scores, address: D })).toEqual({
      votingPower: 330,
      incomingPower: 300,
      outgoingPower: 0,
    })
  })

  test('it works with a forward edge', () => {
    const delegations = {
      [A]: {
        [B]: { weight: 50, expiration: 1 },
        [C]: { weight: 50, expiration: 1 },
      },
      [B]: {
        [D]: { weight: 100, expiration: 2 },
      },
      [C]: {
        [D]: { weight: 100, expiration: 3 },
      },
    }
    const scores = {
      [A]: 1000,
      [B]: 1000,
      [C]: 1000,
      [D]: 500,
    }

    const dags = {
      forward: delegations,
      reverse: inverse(delegations),
    }

    expect(calculateVotingPower({ dags, scores, address: A })).toEqual({
      votingPower: 0,
      incomingPower: 0,
      outgoingPower: 1000,
    })

    expect(calculateVotingPower({ dags, scores, address: B })).toEqual({
      votingPower: 0,
      incomingPower: 500,
      outgoingPower: 1500,
    })

    expect(calculateVotingPower({ dags, scores, address: C })).toEqual({
      votingPower: 0,
      incomingPower: 500,
      outgoingPower: 1500,
    })

    expect(calculateVotingPower({ dags, scores, address: D })).toEqual({
      votingPower: 3500,
      incomingPower: 3000,
      outgoingPower: 0,
    })
  })

  test('it works with a self-referencing edge', () => {
    const delegations = {
      [A]: {
        [B]: { weight: 50, expiration: 1 },
        [C]: { weight: 50, expiration: 1 },
      },
      [B]: {
        [B]: { weight: 20, expiration: 2 },
        [D]: { weight: 80, expiration: 2 },
      },
    }
    const scores = {
      [A]: 500,
      [B]: 300,
      [C]: 0,
      [D]: 50,
    }

    const dags = {
      forward: delegations,
      reverse: inverse(delegations),
    }

    expect(calculateVotingPower({ dags, scores, address: A })).toEqual({
      votingPower: 0,
      incomingPower: 0,
      outgoingPower: 500,
    })

    expect(calculateVotingPower({ dags, scores, address: B })).toEqual({
      votingPower: 110,
      incomingPower: 250,
      outgoingPower: 440,
    })

    expect(calculateVotingPower({ dags, scores, address: C })).toEqual({
      votingPower: 250,
      incomingPower: 250,
      outgoingPower: 0,
    })

    expect(calculateVotingPower({ dags, scores, address: D })).toEqual({
      votingPower: 490,
      incomingPower: 440,
      outgoingPower: 0,
    })
  })

  test('it works when some requested nodes not present in delegation graph', () => {
    const delegations = {
      [A]: {
        [B]: { weight: 20, expiration: 1 },
        [C]: { weight: 80, expiration: 1 },
      },
    }
    const scores = {
      [A]: 1000,
      [B]: 0,
      [C]: 0,
      [D]: 30,
    }
    const dags = {
      forward: delegations,
      reverse: inverse(delegations),
    }

    expect(calculateVotingPower({ dags, scores, address: A })).toEqual({
      votingPower: 0,
      incomingPower: 0,
      outgoingPower: 1000,
    })

    expect(calculateVotingPower({ dags, scores, address: B })).toEqual({
      votingPower: 200,
      incomingPower: 200,
      outgoingPower: 0,
    })

    expect(calculateVotingPower({ dags, scores, address: C })).toEqual({
      votingPower: 800,
      incomingPower: 800,
      outgoingPower: 0,
    })

    expect(calculateVotingPower({ dags, scores, address: D })).toEqual({
      votingPower: 30,
      incomingPower: 0,
      outgoingPower: 0,
    })
  })

  test('it works with an empty delegation graph', () => {
    const scores = {
      [A]: 100,
      [B]: 200,
      [C]: 300,
      [D]: 400,
    }

    const dags = {
      forward: {},
      reverse: {},
    }

    expect(calculateVotingPower({ dags, scores, address: A })).toEqual({
      votingPower: 100,
      incomingPower: 0,
      outgoingPower: 0,
    })

    expect(calculateVotingPower({ dags, scores, address: B })).toEqual({
      votingPower: 200,
      incomingPower: 0,
      outgoingPower: 0,
    })

    expect(calculateVotingPower({ dags, scores, address: C })).toEqual({
      votingPower: 300,
      incomingPower: 0,
      outgoingPower: 0,
    })

    expect(calculateVotingPower({ dags, scores, address: D })).toEqual({
      votingPower: 400,
      incomingPower: 0,
      outgoingPower: 0,
    })
  })

  test('from a bug', () => {
    const scores = {
      '0x91fd2c8d24767db4ece7069aa27832ffaf8590f3': 33.5635622010869,
    }

    const dags = {
      forward: {
        '0x91fd2c8d24767db4ece7069aa27832ffaf8590f3': {
          '0x757a20e145435b5bdaf0e274987653aecd47cf37': {
            weight: 10,
            expiration: 1764562614,
          },
          '0xab54624a67e8c018a06b176baae76a40a385a464': {
            weight: 90,
            expiration: 1764562614,
          },
        },
      },
      reverse: {
        '0x757a20e145435b5bdaf0e274987653aecd47cf37': {
          '0x91fd2c8d24767db4ece7069aa27832ffaf8590f3': {
            weight: 10,
            expiration: 1764562614,
          },
        },
        '0xab54624a67e8c018a06b176baae76a40a385a464': {
          '0x91fd2c8d24767db4ece7069aa27832ffaf8590f3': {
            weight: 90,
            expiration: 1764562614,
          },
        },
      },
    }

    const address = '0x91fd2c8d24767db4ece7069aa27832ffaf8590f3'

    expect(calculateVotingPower({ dags, scores, address })).toEqual({
      votingPower: 0,
      incomingPower: 0,
      outgoingPower: 33.5635622010869,
    })
  })
})
