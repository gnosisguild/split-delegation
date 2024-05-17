import { describe, test } from '@jest/globals'

import filterVertices from './filterVertices'

import { Graph } from '../../types'

describe('filterVertices', () => {
  test('removes a vertex', () => {
    const graph: Graph = {
      A: {
        B: 0,
      },
      B: {},
    }
    expect(filterVertices(graph, ['B'])).toEqual({
      A: {
        B: 0,
      },
    })
  })
  test('nothing to remove', () => {
    const graph: Graph = {
      A: {
        B: 0,
      },
      B: {
        C: 0,
      },
    }

    expect(filterVertices(graph, ['D'])).toEqual({
      A: {
        B: 0,
      },
      B: {
        C: 0,
      },
    })

    expect(filterVertices(graph, [])).toEqual({
      A: {
        B: 0,
      },
      B: {
        C: 0,
      },
    })
  })
})
