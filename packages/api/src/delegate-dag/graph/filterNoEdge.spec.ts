import { describe, test } from '@jest/globals'

import { Graph } from './types'
import filterNoEdge from './filterNoEdge'

describe('filterNoEdge', () => {
  test('nothing to remove', () => {
    const dag: Graph<number> = {
      A: {
        B: 0,
      },
      B: {
        C: 0,
      },
    }

    expect(filterNoEdge(dag)).toEqual({
      A: {
        B: 0,
      },
      B: {
        C: 0,
      },
    })
  })
  test('removes a node', () => {
    const dag: Graph<number> = {
      A: {
        B: 0,
      },
      B: {},
    }
    expect(filterNoEdge(dag)).toEqual({
      A: {
        B: 0,
      },
    })
  })
})
