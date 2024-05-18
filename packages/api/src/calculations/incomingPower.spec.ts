import { describe, test } from '@jest/globals'
import { Address } from 'viem'

import incomingPower from './incomingPower'
import inverse from '../fns/graph/inverse'

describe('incomingPower', () => {
  const A = 'A' as Address
  const B = 'B' as Address
  const C = 'C' as Address
  const D = 'D' as Address

  test('it works when all requested nodes present in weights graph', () => {
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

    expect({
      [A]: incomingPower({
        weights,
        rweights: inverse(weights),
        scores,
        address: A,
      }),
      [B]: incomingPower({
        weights,
        rweights: inverse(weights),
        scores,
        address: B,
      }),
      [C]: incomingPower({
        weights,
        rweights: inverse(weights),
        scores,
        address: C,
      }),
      [D]: incomingPower({
        weights,
        rweights: inverse(weights),
        scores,
        address: D,
      }),
    }).toEqual({
      [A]: 0,
      [B]: 200,
      [C]: 800,
      [D]: 300,
    })
  })

  test.only('it works with a forward edge', () => {
    const weights = {
      [A]: {
        [B]: 50,
        [C]: 50,
      },
      [B]: {
        [D]: 10,
        ['F']: 90,
      },
      [C]: {
        [D]: 70,
        ['F']: 30,
      },
    }
    const scores = {
      [A]: 1000,
      [B]: 1000,
      [C]: 1000,
      [D]: 500,
    }

    expect({
      [A]: incomingPower({
        weights,
        rweights: inverse(weights),
        scores,
        address: A,
      }),
      [B]: incomingPower({
        weights,
        rweights: inverse(weights),
        scores,
        address: B,
      }),
      [C]: incomingPower({
        weights,
        rweights: inverse(weights),
        scores,
        address: C,
      }),
      [D]: incomingPower({
        weights,
        rweights: inverse(weights),
        scores,
        address: D,
      }),
    }).toEqual({
      [A]: 0,
      [B]: 500,
      [C]: 500,
      [D]: 150 + 1050,
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

    expect({
      [A]: incomingPower({
        weights,
        rweights: inverse(weights),
        scores,
        address: A,
      }),
      [B]: incomingPower({
        weights,
        rweights: inverse(weights),
        scores,
        address: B,
      }),
      [C]: incomingPower({
        weights,
        rweights: inverse(weights),
        scores,
        address: C,
      }),
      [D]: incomingPower({
        weights,
        rweights: inverse(weights),
        scores,
        address: D,
      }),
    }).toEqual({
      [A]: 0,
      [B]: 200,
      [C]: 800,
      [D]: 0,
    })
  })

  test.only('it works with an empty delegation graph', () => {
    const weights = {}
    const scores = {
      [A]: 100,
      [B]: 200,
      [C]: 300,
    }

    expect({
      [A]: incomingPower({
        weights,
        rweights: inverse(weights),
        scores,
        address: A,
      }),
      [B]: incomingPower({
        weights,
        rweights: inverse(weights),
        scores,
        address: B,
      }),
      [C]: incomingPower({
        weights,
        rweights: inverse(weights),
        scores,
        address: C,
      }),
    }).toEqual({
      [A]: 0,
      [B]: 0,
      [C]: 0,
    })
  })
})
