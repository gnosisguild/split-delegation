import { describe, test } from '@jest/globals'

import toDAG from './toAcyclical'
import { Graph } from '../../types'

describe('toAcyclical', () => {
  test('one cycle in the graph', () => {
    const graph: Graph = {
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

    expect(toDAG(graph)).toEqual({
      B: {
        C: 0,
      },
      C: {
        A: 0,
      },
    })
  })

  test('two cycles in the graph', () => {
    const graph: Graph = {
      A: {
        B: 0,
      },
      B: {
        C: 0,
      },
      C: {
        A: 0,
      },
      D: {
        E: 0,
      },
      E: {
        F: 0,
      },
      F: {
        D: 0,
      },
    }

    expect(toDAG(graph)).toEqual({
      B: {
        C: 0,
      },
      C: {
        A: 0,
      },
      E: {
        F: 0,
      },
      F: {
        D: 0,
      },
    })
  })

  test('one node makes two cycles in the graph', () => {
    const graph: Graph = {
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

    expect(toDAG(graph)).toEqual({
      B: {
        C: 0,
      },
      C: {
        A: 0,
      },
    })
  })
})
