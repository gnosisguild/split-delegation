import { describe, test } from '@jest/globals'

import filterNoEdge from './filterNoEdge'

import { Weights } from '../../types'

describe('filterNoEdge', () => {
  test('nothing to remove', () => {
    const dag: Weights<number> = {
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
    const dag: Weights<number> = {
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
