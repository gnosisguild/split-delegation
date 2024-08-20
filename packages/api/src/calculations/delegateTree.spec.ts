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
    const delegations = {
      [A]: {
        [B]: { weight: 20, expiration: 1 },
        [C]: { weight: 80, expiration: 1 },
      },
      [B]: {
        [D]: { weight: 100, expiration: 2 },
      },
    }
    const scores = {
      [A]: 1000,
      [B]: 100,
      [C]: 20,
      [D]: 30,
    }

    const dags = {
      forward: delegations,
      reverse: inverse(delegations),
    }

    expect(delegateTree({ dags, scores, address: A })).toEqual([
      {
        delegate: B,
        expiration: 1,
        weight: 2000,
        delegatedPower: 200,
        children: [
          {
            delegate: D,
            expiration: 2,
            weight: 10000,
            delegatedPower: 300,
            children: [],
          },
        ],
      },
      {
        delegate: C,
        expiration: 1,
        weight: 8000,
        delegatedPower: 800,
        children: [],
      },
    ])
    expect(delegateTree({ dags, scores, address: B })).toEqual([
      {
        delegate: D,
        expiration: 2,
        weight: 10000,
        delegatedPower: 300,
        children: [],
      },
    ])
    expect(delegateTree({ dags, scores, address: C })).toEqual([])
    expect(delegateTree({ dags, scores, address: D })).toEqual([])
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
      [B]: 2000,
      [C]: 3000,
      [D]: 500,
    }

    const dags = {
      forward: delegations,
      reverse: inverse(delegations),
    }

    expect(delegateTree({ dags, scores, address: A })).toEqual([
      {
        delegate: B,
        expiration: 1,
        weight: 5000,
        delegatedPower: 500,
        children: [
          {
            delegate: D,
            expiration: 2,
            weight: 10000,
            delegatedPower: 2500,
            children: [],
          },
        ],
      },
      {
        delegate: C,
        expiration: 1,
        weight: 5000,
        delegatedPower: 500,
        children: [
          {
            delegate: D,
            expiration: 3,
            weight: 10000,
            delegatedPower: 3500,
            children: [],
          },
        ],
      },
    ])
    expect(delegateTree({ dags, scores, address: B })).toEqual([
      {
        delegate: D,
        expiration: 2,
        weight: 10000,
        delegatedPower: 2500,
        children: [],
      },
    ])
    expect(delegateTree({ dags, scores, address: C })).toEqual([
      {
        delegate: D,
        expiration: 3,
        weight: 10000,
        delegatedPower: 3500,
        children: [],
      },
    ])
    expect(delegateTree({ dags, scores, address: D })).toEqual([])
  })

  test('it correctly calculates weights even when all scores are zero', () => {
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
      [A]: 0,
      [B]: 0,
      [C]: 0,
      [D]: 0,
    }

    const dags = {
      forward: delegations,
      reverse: inverse(delegations),
    }

    expect(delegateTree({ dags, scores, address: A })).toEqual([
      {
        delegate: B,
        expiration: 1,
        weight: 5000,
        delegatedPower: 0,
        children: [
          {
            delegate: D,
            expiration: 2,
            weight: 10000,
            delegatedPower: 0,
            children: [],
          },
        ],
      },
      {
        delegate: C,
        expiration: 1,
        weight: 5000,
        delegatedPower: 0,
        children: [
          {
            delegate: D,
            expiration: 3,
            weight: 10000,
            delegatedPower: 0,
            children: [],
          },
        ],
      },
    ])
    expect(delegateTree({ dags, scores, address: B })).toEqual([
      {
        delegate: D,
        expiration: 2,
        weight: 10000,
        delegatedPower: 0,
        children: [],
      },
    ])
    expect(delegateTree({ dags, scores, address: C })).toEqual([
      {
        delegate: D,
        expiration: 3,
        weight: 10000,
        delegatedPower: 0,
        children: [],
      },
    ])
    expect(delegateTree({ dags, scores, address: D })).toEqual([])
  })

  test('a self referencing edge is not included as delegate', () => {
    const delegations = {
      [A]: {
        [A]: { weight: 10, expiration: 1 },
        [B]: { weight: 30, expiration: 1 },
        [C]: { weight: 60, expiration: 1 },
      },
      [B]: {
        [D]: { weight: 100, expiration: 2 },
      },
    }
    const scores = {
      [A]: 100,
      [B]: 0,
      [C]: 0,
      [D]: 20,
    }

    const dags = {
      forward: delegations,
      reverse: inverse(delegations),
    }

    expect(delegateTree({ dags, scores, address: A })).toEqual([
      {
        delegate: B,
        expiration: 1,
        weight: 3000,
        delegatedPower: 30,
        children: [
          {
            delegate: D,
            expiration: 2,
            weight: 10000,
            delegatedPower: 30,
            children: [],
          },
        ],
      },
      {
        delegate: C,
        expiration: 1,
        weight: 6000,
        delegatedPower: 60,
        children: [],
      },
    ])
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

    expect(delegateTree({ dags, scores, address: A })).toEqual([
      {
        delegate: B,
        expiration: 1,
        weight: 2000,
        delegatedPower: 200,
        children: [],
      },
      {
        delegate: C,
        expiration: 1,
        weight: 8000,
        delegatedPower: 800,
        children: [],
      },
    ])
    expect(delegateTree({ dags, scores, address: B })).toEqual([])
    expect(delegateTree({ dags, scores, address: C })).toEqual([])
    expect(delegateTree({ dags, scores, address: D })).toEqual([])
  })

  test('it works with an empty delegation graph', () => {
    const scores = {
      [A]: 100,
      [B]: 200,
      [C]: 300,
    }

    const dags = {
      forward: {},
      reverse: {},
    }

    expect(delegateTree({ dags, scores, address: A })).toEqual([])
    expect(delegateTree({ dags, scores, address: B })).toEqual([])
    expect(delegateTree({ dags, scores, address: C })).toEqual([])
  })
})
