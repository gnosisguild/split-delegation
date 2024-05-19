import { describe, test } from '@jest/globals'

import createGraph from './createGraph'

describe('createGraph', () => {
  const A = 'A'
  const B = 'B'
  const C = 'C'
  const D = 'D'

  test('it sets one delegator', () => {
    const edges = [{ delegator: A, delegate: B, weight: 100 }]

    const result = createGraph(edges)

    expect(result).toEqual({ A: { B: 100 } })
  })

  test('it sets multiple delegators', () => {
    const edges = [
      { delegator: A, delegate: B, weight: 8 },
      { delegator: B, delegate: C, weight: 9 },
    ]

    const result = createGraph(edges)

    expect(result).toEqual({
      A: { B: 8 },
      B: { C: 9 },
    })
  })

  test('it does not include an edge that would originate a cycle', () => {
    const edges = [
      { delegator: A, delegate: B, weight: 1 },
      { delegator: B, delegate: C, weight: 2 },
      { delegator: C, delegate: A, weight: 3 },
      { delegator: C, delegate: D, weight: 4 },
    ]

    const result = createGraph(edges)

    expect(result).toEqual({
      A: { B: 1 },
      B: { C: 2 },
      C: { D: 4 },
    })
  })

  test('it does not output empty bag when removed due to cycle', () => {
    const edges = [
      { delegator: A, delegate: B, weight: 1 },
      { delegator: B, delegate: C, weight: 2 },
      { delegator: C, delegate: A, weight: 1300 },
    ]

    const result = createGraph(edges)

    expect(result).toEqual({
      A: { B: 1 },
      B: { C: 2 },
    })
  })

  test('oldest cycle edge is removed', () => {
    expect(
      createGraph([
        { delegator: A, delegate: B, weight: 1 },
        { delegator: B, delegate: C, weight: 2 },
        { delegator: C, delegate: A, weight: 3 },
      ])
    ).toEqual({
      A: { B: 1 },
      B: { C: 2 },
    })

    expect(
      createGraph([
        { delegator: C, delegate: A, weight: 3 },
        { delegator: A, delegate: B, weight: 1 },
        { delegator: B, delegate: C, weight: 2 },
      ])
    ).toEqual({
      A: { B: 1 },
      C: { A: 3 },
    })
  })
})
