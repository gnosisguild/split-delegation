import { describe, test } from '@jest/globals'
import { Address } from 'viem'

import inverse from '../fns/graph/inverse'
import delegatorTree from './delegatorTree'

describe('delegatorTree', () => {
  const A = 'A' as Address
  const B = 'B' as Address
  const C = 'C' as Address
  const D = 'D' as Address
  const E = 'E' as Address

  test('it goes up delegators and ignores unrelated forks', () => {
    const delegations = {
      [A]: {
        [B]: { weight: 50, expiration: 1 },
        [C]: { weight: 50, expiration: 1 },
      },
      [B]: {
        [D]: { weight: 900, expiration: 2 },
        [E]: { weight: 100, expiration: 2 },
      },
    }
    const scores = {
      [A]: 0,
      [B]: 0,
      [C]: 0,
      [D]: 0,
      [E]: 0,
    }

    const dags = {
      forward: delegations,
      reverse: inverse(delegations),
    }

    expect(delegatorTree({ dags, scores, address: D })).toEqual([
      {
        delegator: B,
        expiration: 2,
        weight: 9000,
        delegatedPower: 0,
        parents: [
          {
            delegator: A,
            expiration: 1,
            weight: 5000,
            delegatedPower: 0,
            parents: [],
          },
        ],
      },
    ])
  })

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
      [A]: 0,
      [B]: 0,
      [C]: 0,
      [D]: 0,
    }

    const dags = {
      forward: delegations,
      reverse: inverse(delegations),
    }

    expect(delegatorTree({ dags, scores, address: A })).toEqual([])
    expect(delegatorTree({ dags, scores, address: B })).toEqual([
      {
        delegator: A,
        expiration: 1,
        weight: 2000,
        delegatedPower: 0,
        parents: [],
      },
    ])
    expect(delegatorTree({ dags, scores, address: C })).toEqual([
      {
        delegator: A,
        expiration: 1,
        weight: 8000,
        delegatedPower: 0,
        parents: [],
      },
    ])
    expect(delegatorTree({ dags, scores, address: D })).toEqual([
      {
        delegator: B,
        expiration: 2,
        weight: 10000,
        delegatedPower: 0,
        parents: [
          {
            delegator: A,
            expiration: 1,
            weight: 2000,
            delegatedPower: 0,
            parents: [],
          },
        ],
      },
    ])
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

    expect(delegatorTree({ dags, scores, address: A })).toEqual([])
    expect(delegatorTree({ dags, scores, address: B })).toEqual([
      {
        delegator: A,
        expiration: 1,
        weight: 5000,
        delegatedPower: 500,
        parents: [],
      },
    ])
    expect(delegatorTree({ dags, scores, address: C })).toEqual([
      {
        delegator: A,
        expiration: 1,
        weight: 5000,
        delegatedPower: 500,
        parents: [],
      },
    ])
    expect(delegatorTree({ dags, scores, address: D })).toEqual([
      {
        delegator: B,
        expiration: 2,
        weight: 10000,
        delegatedPower: 2500,
        parents: [
          {
            delegator: A,
            expiration: 1,
            weight: 5000,
            delegatedPower: 500,
            parents: [],
          },
        ],
      },
      {
        delegator: C,
        expiration: 3,
        weight: 10000,
        delegatedPower: 3500,
        parents: [
          {
            delegator: A,
            expiration: 1,
            weight: 5000,
            delegatedPower: 500,
            parents: [],
          },
        ],
      },
    ])
  })

  test('it works when a self referencing edge is present', () => {
    const delegations = {
      [A]: {
        [A]: { weight: 10, expiration: 1 },
        [B]: { weight: 20, expiration: 1 },
        [C]: { weight: 70, expiration: 1 },
      },
      [B]: {
        [D]: { weight: 100, expiration: 2 },
      },
    }
    const scores = {
      [A]: 1000,
      [B]: 0,
      [C]: 0,
      [D]: 0,
    }

    const dags = {
      forward: delegations,
      reverse: inverse(delegations),
    }

    expect(delegatorTree({ dags, scores, address: A })).toEqual([])
    expect(delegatorTree({ dags, scores, address: B })).toEqual([
      {
        delegator: A,
        expiration: 1,
        weight: 2000,
        delegatedPower: 200,
        parents: [],
      },
    ])
    expect(delegatorTree({ dags, scores, address: C })).toEqual([
      {
        delegator: A,
        expiration: 1,
        weight: 7000,
        delegatedPower: 700,
        parents: [],
      },
    ])
    expect(delegatorTree({ dags, scores, address: D })).toEqual([
      {
        delegator: B,
        expiration: 2,
        weight: 10000,
        delegatedPower: 200,
        parents: [
          {
            delegator: A,
            expiration: 1,
            weight: 2000,
            delegatedPower: 200,
            parents: [],
          },
        ],
      },
    ])
  })

  test('it works when some requested nodes not present in delegation graph', () => {
    const delegations = {
      [A]: {
        [B]: { weight: 20, expiration: 111 },
        [C]: { weight: 80, expiration: 222 },
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

    expect(delegatorTree({ dags, scores, address: A })).toEqual([])
    expect(delegatorTree({ dags, scores, address: B })).toEqual([
      {
        delegator: A,
        expiration: 111,
        weight: 2000,
        delegatedPower: 200,
        parents: [],
      },
    ])
    expect(delegatorTree({ dags, scores, address: C })).toEqual([
      {
        delegator: A,
        expiration: 222,
        weight: 8000,
        delegatedPower: 800,
        parents: [],
      },
    ])
    expect(delegatorTree({ dags, scores, address: D })).toEqual([])
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
    expect(delegatorTree({ dags, scores, address: A })).toEqual([])
    expect(delegatorTree({ dags, scores, address: B })).toEqual([])
    expect(delegatorTree({ dags, scores, address: C })).toEqual([])
  })
})
