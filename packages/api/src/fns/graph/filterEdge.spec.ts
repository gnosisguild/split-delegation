import { describe, test } from '@jest/globals'

import filterEdge from './filterEdge'

import { Graph } from '../../types'

describe('filterEdge', () => {
  test('it removes an edge', () => {
    const graph: Graph = {
      A: {
        B: 1,
        C: 1,
      },
      D: {
        E: 1,
      },
    }

    expect(filterEdge(graph, 'A', 'B')).toEqual({
      A: {
        C: 1,
      },
      D: {
        E: 1,
      },
    })
  })
  test('it also removes the vertex if no more edges are left', () => {
    const graph: Graph = {
      A: {
        B: 1,
        C: 1,
      },
      D: {
        E: 1,
      },
    }

    expect(filterEdge(graph, 'D', 'E')).toEqual({
      A: {
        B: 1,
        C: 1,
      },
    })
  })
})
