import { describe, test } from '@jest/globals'

import filterEdge from './filterEdge'

import { Weights } from '../../types'

describe('filterEdge', () => {
  test('it removes an edge', () => {
    const dag: Weights<number> = {
      A: {
        B: 1,
        C: 1,
      },
      D: {
        E: 1,
      },
    }

    expect(filterEdge(dag, 'A', 'B')).toEqual({
      A: {
        C: 1,
      },
      D: {
        E: 1,
      },
    })
  })
  test('it also removes the vertex if no more edges are left', () => {
    const dag: Weights<number> = {
      A: {
        B: 1,
        C: 1,
      },
      D: {
        E: 1,
      },
    }

    expect(filterEdge(dag, 'D', 'E')).toEqual({
      A: {
        B: 1,
        C: 1,
      },
    })
  })
})
