import { describe, test } from '@jest/globals'

import kahn from './sort'

import { Weights } from '../../types'

describe('sort', () => {
  test('no cycles', () => {
    const dag: Weights<number> = {
      A: {
        C: 0,
        B: 0,
        E: 0,
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

    expect(kahn(dag)).toEqual(['A', 'B', 'C', 'D', 'E'])
  })

  test('with partition', () => {
    const dag: Weights<number> = {
      A: {
        B: 0,
      },
      B: {
        C: 0,
      },
      C: {},
      D: {
        E: 0,
      },
      E: {
        F: 0,
      },
      F: {},
    }

    const result = kahn(dag)
    expect(result.indexOf('A')).toBeLessThan(result.indexOf('B'))
    expect(result.indexOf('B')).toBeLessThan(result.indexOf('C'))
    expect(result.indexOf('C')).toBeGreaterThan(-1)

    expect(result.indexOf('D')).toBeLessThan(result.indexOf('E'))
    expect(result.indexOf('E')).toBeLessThan(result.indexOf('F'))
    expect(result.indexOf('F')).toBeGreaterThan(-1)
  })

  test('throws on cycle', () => {
    const dag: Weights<number> = {
      A: {
        B: 0,
        C: 0,
      },
      B: {
        C: 0,
      },
      C: {
        A: 0,
      },
    }

    expect(() => kahn(dag)).toThrow()
  })
})
