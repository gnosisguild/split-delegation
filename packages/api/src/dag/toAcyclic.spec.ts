import { describe, test } from '@jest/globals'

import toAcyclic from './toAcyclic'

import { DAG } from './types'

describe('toAcyclic', () => {
  test('one cycle in the graph', () => {
    const dag: DAG<number> = {
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

    expect(toAcyclic(dag)).toEqual({
      A: {},
      B: {
        C: 0,
      },
      C: {
        A: 0,
      },
    })
  })

  test('two cycles in the graph', () => {
    const dag: DAG<number> = {
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

    expect(toAcyclic(dag)).toEqual({
      A: {},
      B: {
        C: 0,
      },
      C: {
        A: 0,
      },
      D: {},
      E: {
        F: 0,
      },
      F: {
        D: 0,
      },
    })
  })

  test('one node makes two cycles in the graph', () => {
    const dag: DAG<number> = {
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

    expect(toAcyclic(dag)).toEqual({
      A: {},
      B: {
        C: 0,
      },
      C: {
        A: 0,
      },
    })
  })
})
