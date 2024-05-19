import { describe, test } from '@jest/globals'

import findCycle from './findCycle'

import { Graph } from '../../types'

describe('findCycle', () => {
  test('no back edge, no forward edge', () => {
    const graph: Graph = {
      A: {
        B: 0,
      },
      B: {
        C: 0,
      },
    }

    expect(findCycle(graph)).toEqual(null)
  })
  test('yes back edge, no forward edge', () => {
    const graph: Graph = {
      A: {
        B: 0,
      },
      B: {
        C: 0,
      },
      C: {
        D: 0,
      },
      D: {
        B: 0,
      },
    }
    expect(findCycle(graph)).toEqual([
      ['B', 'C'],
      ['C', 'D'],
      ['D', 'B'],
    ])
  })
  test('no back edge, yes forward edge', () => {
    const graph: Graph = {
      A: {
        B: 0,
        C: 0,
        D: 0,
      },
      B: {
        C: 0,
      },
      C: {
        D: 0,
      },
      D: {
        E: 0,
      },
    }
    expect(findCycle(graph)).toEqual(null)
  })
  test('yes back edge, yes forward edge', () => {
    const graph: Graph = {
      A: { D: 0, B: 0 },
      B: { C: 0 },
      C: { D: 0 },
      D: { E: 0 },
      E: { B: 0 },
    }
    expect(findCycle(graph)).toEqual([
      ['D', 'E'],
      ['E', 'B'],
      ['B', 'C'],
      ['C', 'D'],
    ])
  })
  test('another: yes back edge, yes forward edge', () => {
    const graph: Graph = {
      A: { B: 0 },
      B: { C: 0 },
      C: { A: 0, D: 0 },
      D: { E: 0 },
      E: {},
    }
    expect(findCycle(graph)).toEqual([
      ['A', 'B'],
      ['B', 'C'],
      ['C', 'A'],
    ])
  })
  test('self-referencing edge does not trigger a cycle', () => {
    const graph: Graph = {
      A: {
        B: 0,
        C: 0,
        D: 0,
      },
      B: {
        B: 0,
        C: 0,
      },
      C: {
        D: 0,
      },
      D: {
        E: 0,
      },
    }
    expect(findCycle(graph)).toEqual(null)
  })
})
