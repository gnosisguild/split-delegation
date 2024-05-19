import { describe, test } from '@jest/globals'

import hasCycle from './hasCycle'

import { Graph } from '../../types'

describe('hasCycle', () => {
  test('no back edge, no forward edge', () => {
    const graph: Graph = {
      A: {
        B: 0,
      },
      B: {
        C: 0,
      },
    }

    expect(hasCycle(graph)).toEqual(false)
  })
  test('yes back edge, no forward edge', () => {
    const graph: Graph = {
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
    expect(hasCycle(graph)).toEqual(true)
  })
  test('no back edge, yes forward edge', () => {
    const graph: Graph = {
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
    expect(hasCycle(graph)).toEqual(false)
  })
  test('yes back edge, yes forward edge', () => {
    const graph: Graph = {
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
    expect(hasCycle(graph)).toEqual(true)
  })

  test('another: yes back edge, yes forward edge', () => {
    const graph: Graph = {
      A: { B: 0 },
      B: { C: 0 },
      C: { A: 0, D: 0 },
      D: { E: 0 },
      E: {},
    }
    expect(hasCycle(graph)).toEqual(true)
  })

  test('self-referencing edge does not create a cycle.', () => {
    const graph: Graph = {
      A: { B: 0 },
      B: { B: 0, C: 0 },
      C: { D: 0 },
    }
    expect(hasCycle(graph)).toEqual(false)

    expect(hasCycle({ ...graph, D: { A: 0 } })).toEqual(true)
  })
})
