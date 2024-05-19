import { describe, test } from '@jest/globals'
import { Address } from 'viem'

import inverse from '../fns/graph/inverse'
import delegateTree from './delegateTree'

describe('delegateTree', () => {
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

    expect(delegateTree({ weights, rweights, scores, address: A })).toEqual([
      {
        delegate: B,
        weight: 2000,
        delegatedPower: 200,
        children: [
          {
            delegate: D,
            weight: 10000,
            delegatedPower: 300,
            children: [],
          },
        ],
      },
      {
        delegate: C,
        weight: 8000,
        delegatedPower: 800,
        children: [],
      },
    ])
    expect(delegateTree({ weights, rweights, scores, address: B })).toEqual([
      {
        delegate: D,
        weight: 10000,
        delegatedPower: 300,
        children: [],
      },
    ])
    expect(delegateTree({ weights, rweights, scores, address: C })).toEqual([])
    expect(delegateTree({ weights, rweights, scores, address: D })).toEqual([])
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

    expect(delegateTree({ weights, rweights, scores, address: A })).toEqual([
      {
        delegate: B,
        weight: 5000,
        delegatedPower: 500,
        children: [
          {
            delegate: D,
            weight: 10000,
            delegatedPower: 2500,
            children: [],
          },
        ],
      },
      {
        delegate: C,
        weight: 5000,
        delegatedPower: 500,
        children: [
          {
            delegate: D,
            weight: 10000,
            delegatedPower: 3500,
            children: [],
          },
        ],
      },
    ])
    expect(delegateTree({ weights, rweights, scores, address: B })).toEqual([
      {
        delegate: D,
        weight: 10000,
        delegatedPower: 2500,
        children: [],
      },
    ])
    expect(delegateTree({ weights, rweights, scores, address: C })).toEqual([
      {
        delegate: D,
        weight: 10000,
        delegatedPower: 3500,
        children: [],
      },
    ])
    expect(delegateTree({ weights, rweights, scores, address: D })).toEqual([])
  })

  test('a self referencing edge is not included as delegate', () => {
    const weights = {
      [A]: {
        [A]: 10,
        [B]: 30,
        [C]: 60,
      },
      [B]: {
        [D]: 100,
      },
    }
    const scores = {
      [A]: 100,
      [B]: 0,
      [C]: 0,
      [D]: 20,
    }

    const rweights = inverse(weights)

    expect(delegateTree({ weights, rweights, scores, address: A })).toEqual([
      {
        delegate: B,
        weight: 3000,
        delegatedPower: 30,
        children: [
          {
            delegate: D,
            weight: 10000,
            delegatedPower: 30,
            children: [],
          },
        ],
      },
      {
        delegate: C,
        weight: 6000,
        delegatedPower: 60,
        children: [],
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

    expect(delegateTree({ weights, rweights, scores, address: A })).toEqual([
      {
        delegate: B,
        weight: 2000,
        delegatedPower: 200,
        children: [],
      },
      {
        delegate: C,
        weight: 8000,
        delegatedPower: 800,
        children: [],
      },
    ])
    expect(delegateTree({ weights, rweights, scores, address: B })).toEqual([])
    expect(delegateTree({ weights, rweights, scores, address: C })).toEqual([])
    expect(delegateTree({ weights, rweights, scores, address: D })).toEqual([])
  })

  test('it works with an empty delegation graph', () => {
    const weights = {}
    const scores = {
      [A]: 100,
      [B]: 200,
      [C]: 300,
    }

    const rweights = inverse(weights)
    expect(delegateTree({ weights, rweights, scores, address: A })).toEqual([])
    expect(delegateTree({ weights, rweights, scores, address: B })).toEqual([])
    expect(delegateTree({ weights, rweights, scores, address: C })).toEqual([])
  })
})
