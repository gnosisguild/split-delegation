import { describe, test } from '@jest/globals'
import merge from './merge'

describe('merge', () => {
  test('it works with no keys', () => {
    expect(merge({})).toEqual({})
  })

  test('it works without key overlap', () => {
    expect(merge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 })
  })

  test('it works with key overlap', () => {
    expect(merge({ a: 1, c: 1 }, { b: 2, c: 2 })).toEqual({
      a: 1,
      b: 2,
      c: 3,
    })
  })
})
