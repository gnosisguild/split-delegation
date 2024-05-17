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
    expect(findCycle(graph)).toEqual(['B', 'C', 'D'])
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
      A: {
        D: 0,
        B: 0,
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
      E: {
        B: 0,
      },
    }
    expect(findCycle(graph)).toEqual(['D', 'E', 'B', 'C'])
  })
})
