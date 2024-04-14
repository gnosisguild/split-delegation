import { describe, test } from '@jest/globals'

import { findCycle } from './findCycle'

import { DAG } from './types'

describe('findCycle', () => {
  test('no back edge, no forward edge', () => {
    const dag: DAG<number> = {
      A: {
        B: 0,
      },
      B: {
        C: 0,
      },
    }

    expect(findCycle(dag)).toEqual(null)
  })
  test('yes back edge, no forward edge', () => {
    const dag: DAG<number> = {
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
    expect(findCycle(dag)).toEqual(['B', 'C', 'D'])
  })
  test('no back edge, yes forward edge', () => {
    const dag: DAG<number> = {
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
    expect(findCycle(dag)).toEqual(null)
  })
  test('yes back edge, yes forward edge', () => {
    const dag: DAG<number> = {
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
    expect(findCycle(dag)).toEqual(['D', 'E', 'B', 'C'])
  })
})
