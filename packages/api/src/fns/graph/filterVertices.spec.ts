import { describe, test } from '@jest/globals'

import filterVertices from './filterVertices'

import { Weights } from '../../types'

describe('filterVertices', () => {
  test('removes a vertex', () => {
    const weights: Weights<number> = {
      A: {
        B: 0,
      },
      B: {},
    }
    expect(filterVertices(weights, ['B'])).toEqual({
      A: {
        B: 0,
      },
    })
  })
  test('nothing to remove', () => {
    const weights: Weights<number> = {
      A: {
        B: 0,
      },
      B: {
        C: 0,
      },
    }

    expect(filterVertices(weights, ['D'])).toEqual({
      A: {
        B: 0,
      },
      B: {
        C: 0,
      },
    })

    expect(filterVertices(weights, [])).toEqual({
      A: {
        B: 0,
      },
      B: {
        C: 0,
      },
    })
  })
})
