import { describe, test } from '@jest/globals'

import createDelegationGraph from './createDelegationGraph'

describe('createDelegationGraph', () => {
  const A = 'A'
  const B = 'B'
  const C = 'C'
  const D = 'D'

  test('it sets one delegator', () => {
    const edges = [{ delegator: A, delegate: B, weight: 100, expiration: 123 }]

    const result = createDelegationGraph(edges)

    expect(result).toEqual({ A: { B: { weight: 100, expiration: 123 } } })
  })

  test('it sets multiple delegators', () => {
    const edges = [
      { delegator: A, delegate: B, weight: 8, expiration: 456 },
      { delegator: B, delegate: C, weight: 9, expiration: 456 },
    ]

    const result = createDelegationGraph(edges)

    expect(result).toEqual({
      A: { B: { weight: 8, expiration: 456 } },
      B: { C: { weight: 9, expiration: 456 } },
    })
  })

  test('it sets a self-referecing edge', () => {
    const edges = [
      { delegator: A, delegate: B, weight: 50, expiration: 0 },
      { delegator: A, delegate: A, weight: 50, expiration: 1 },
      { delegator: B, delegate: C, weight: 100, expiration: 2 },
    ]

    const result = createDelegationGraph(edges)

    expect(result).toEqual({
      A: { A: { weight: 50, expiration: 1 }, B: { weight: 50, expiration: 0 } },
      B: { C: { weight: 100, expiration: 2 } },
    })
  })

  test('it does not include an edge that would originate a cycle', () => {
    const edges = [
      { delegator: A, delegate: B, weight: 1, expiration: 20 },
      { delegator: B, delegate: C, weight: 2, expiration: 20 },
      { delegator: C, delegate: A, weight: 3, expiration: 20 },
      { delegator: C, delegate: D, weight: 4, expiration: 20 },
    ]

    const result = createDelegationGraph(edges)

    expect(result).toEqual({
      A: { B: { weight: 1, expiration: 20 } },
      B: { C: { weight: 2, expiration: 20 } },
      C: { D: { weight: 4, expiration: 20 } },
    })
  })

  test('it does not output empty bag when removed due to cycle', () => {
    const edges = [
      { delegator: A, delegate: B, weight: 1, expiration: 0 },
      { delegator: B, delegate: C, weight: 2, expiration: 0 },
      { delegator: C, delegate: A, weight: 1300, expiration: 0 },
    ]

    const result = createDelegationGraph(edges)

    expect(result).toEqual({
      A: { B: { weight: 1, expiration: 0 } },
      B: { C: { weight: 2, expiration: 0 } },
    })
  })

  test('oldest cycle edge is removed', () => {
    expect(
      createDelegationGraph([
        { delegator: A, delegate: B, weight: 1, expiration: 0 },
        { delegator: B, delegate: C, weight: 2, expiration: 0 },
        { delegator: C, delegate: A, weight: 3, expiration: 0 },
      ])
    ).toEqual({
      A: { B: { weight: 1, expiration: 0 } },
      B: { C: { weight: 2, expiration: 0 } },
    })

    expect(
      createDelegationGraph([
        { delegator: C, delegate: A, weight: 3, expiration: 0 },
        { delegator: A, delegate: B, weight: 1, expiration: 0 },
        { delegator: B, delegate: C, weight: 2, expiration: 0 },
      ])
    ).toEqual({
      A: { B: { weight: 1, expiration: 0 } },
      C: { A: { weight: 3, expiration: 0 } },
    })
  })
})
