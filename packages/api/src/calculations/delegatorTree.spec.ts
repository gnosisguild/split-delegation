import { describe, test } from '@jest/globals'
import { Address } from 'viem'

import inverse from '../fns/graph/inverse'
import delegatorTree from './delegatorTree'

describe('delegatorTree', () => {
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

    const rweights = inverse(weights)

    expect(delegatorTree({ weights, rweights, scores, address: A })).toEqual([])
    expect(delegatorTree({ weights, rweights, scores, address: B })).toEqual([
      {
        delegator: A,
        weight: 2000,
        delegatedPower: 200,
        parents: [],
      },
    ])
    expect(delegatorTree({ weights, rweights, scores, address: C })).toEqual([
      {
        delegator: A,
        weight: 8000,
        delegatedPower: 800,
        parents: [],
      },
    ])
    expect(delegatorTree({ weights, rweights, scores, address: D })).toEqual([
      {
        delegator: B,
        weight: 10000,
        delegatedPower: 300,
        parents: [
          {
            delegator: A,
            weight: 2000,
            delegatedPower: 200,
            parents: [],
          },
        ],
      },
    ])
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
      [B]: 2000,
      [C]: 3000,
      [D]: 500,
    }

    const rweights = inverse(weights)

    expect(delegatorTree({ weights, rweights, scores, address: A })).toEqual([])
    expect(delegatorTree({ weights, rweights, scores, address: B })).toEqual([
      {
        delegator: A,
        weight: 5000,
        delegatedPower: 500,
        parents: [],
      },
    ])
    expect(delegatorTree({ weights, rweights, scores, address: C })).toEqual([
      {
        delegator: A,
        weight: 5000,
        delegatedPower: 500,
        parents: [],
      },
    ])
    expect(delegatorTree({ weights, rweights, scores, address: D })).toEqual([
      {
        delegator: B,
        weight: 10000,
        delegatedPower: 2500,
        parents: [
          {
            delegator: A,
            weight: 5000,
            delegatedPower: 500,
            parents: [],
          },
        ],
      },
      {
        delegator: C,
        weight: 10000,
        delegatedPower: 3500,
        parents: [
          {
            delegator: A,
            weight: 5000,
            delegatedPower: 500,
            parents: [],
          },
        ],
      },
    ])
  })

  test('it works when a self referencing edge is present', () => {
    const weights = {
      [A]: {
        [A]: 10,
        [B]: 20,
        [C]: 70,
      },
      [B]: {
        [D]: 100,
      },
    }
    const scores = {
      [A]: 1000,
      [B]: 0,
      [C]: 0,
      [D]: 0,
    }

    const rweights = inverse(weights)

    expect(delegatorTree({ weights, rweights, scores, address: A })).toEqual([])
    expect(delegatorTree({ weights, rweights, scores, address: B })).toEqual([
      {
        delegator: A,
        weight: 2000,
        delegatedPower: 200,
        parents: [],
      },
    ])
    expect(delegatorTree({ weights, rweights, scores, address: C })).toEqual([
      {
        delegator: A,
        weight: 7000,
        delegatedPower: 700,
        parents: [],
      },
    ])
    expect(delegatorTree({ weights, rweights, scores, address: D })).toEqual([
      {
        delegator: B,
        weight: 10000,
        delegatedPower: 200,
        parents: [
          {
            delegator: A,
            weight: 2000,
            delegatedPower: 200,
            parents: [],
          },
        ],
      },
    ])
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

    expect(delegatorTree({ weights, rweights, scores, address: A })).toEqual([])
    expect(delegatorTree({ weights, rweights, scores, address: B })).toEqual([
      {
        delegator: A,
        weight: 2000,
        delegatedPower: 200,
        parents: [],
      },
    ])
    expect(delegatorTree({ weights, rweights, scores, address: C })).toEqual([
      {
        delegator: A,
        weight: 8000,
        delegatedPower: 800,
        parents: [],
      },
    ])
    expect(delegatorTree({ weights, rweights, scores, address: D })).toEqual([])
  })

  test('it works with an empty delegation graph', () => {
    const weights = {}
    const scores = {
      [A]: 100,
      [B]: 200,
      [C]: 300,
    }

    const rweights = inverse(weights)
    expect(delegatorTree({ weights, rweights, scores, address: A })).toEqual([])
    expect(delegatorTree({ weights, rweights, scores, address: B })).toEqual([])
    expect(delegatorTree({ weights, rweights, scores, address: C })).toEqual([])
  })
})
