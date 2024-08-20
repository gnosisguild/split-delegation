import { describe, test } from '@jest/globals'

import inverse from './inverse'

describe('inverse', () => {
  test('it works inverses a graph', () => {
    const graph = {
      a: { b: 1, c: 2 },
      d: { e: 3, f: 4 },
      g: { b: 5 },
    }

    expect(inverse(graph)).toEqual({
      b: { a: 1, g: 5 },
      c: { a: 2 },
      e: { d: 3 },
      f: { d: 4 },
    })
  })
})
