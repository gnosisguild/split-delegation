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
        delegatedPower: 200,
        percentDelegatedPower: 2000,
        children: [
          {
            delegate: D,
            delegatedPower: 300,
            percentDelegatedPower: 10000,
            children: [],
          },
        ],
      },
      {
        delegate: C,
        delegatedPower: 800,
        percentDelegatedPower: 8000,
        children: [],
      },
    ])
    expect(delegateTree({ weights, rweights, scores, address: B })).toEqual([
      {
        delegate: D,
        delegatedPower: 300,
        percentDelegatedPower: 10000,
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
        delegatedPower: 500,
        percentDelegatedPower: 5000,
        children: [
          {
            delegate: D,
            delegatedPower: 2500,
            percentDelegatedPower: 10000,
            children: [],
          },
        ],
      },
      {
        delegate: C,
        delegatedPower: 500,
        percentDelegatedPower: 5000,
        children: [
          {
            delegate: D,
            delegatedPower: 3500,
            percentDelegatedPower: 10000,
            children: [],
          },
        ],
      },
    ])
    expect(delegateTree({ weights, rweights, scores, address: B })).toEqual([
      {
        delegate: D,
        delegatedPower: 2500,
        percentDelegatedPower: 10000,
        children: [],
      },
    ])
    expect(delegateTree({ weights, rweights, scores, address: C })).toEqual([
      {
        delegate: D,
        delegatedPower: 3500,
        percentDelegatedPower: 10000,
        children: [],
      },
    ])
    expect(delegateTree({ weights, rweights, scores, address: D })).toEqual([])
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
        delegatedPower: 200,
        percentDelegatedPower: 2000,
        children: [],
      },
      {
        delegate: C,
        delegatedPower: 800,
        percentDelegatedPower: 8000,
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
