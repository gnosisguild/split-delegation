import { describe, test } from '@jest/globals'
import { compare } from './diff'
import { DelegationEvent } from '@prisma/client'

describe('diff - compare', () => {
  test('it detects deletions', () => {
    const item = { id: 'deleteme' } as DelegationEvent

    expect(compare({ prev: [item], next: [] })).toEqual({
      create: [],
      delete: [item],
    })
  })
  test('it detects creations', () => {
    const item = { id: 'createme' } as DelegationEvent
    expect(compare({ prev: [], next: [item] })).toEqual({
      create: [item],
      delete: [],
    })
  })

  test('it detects both', () => {
    const deleteme = { id: 'deleteme' } as DelegationEvent
    const createme = { id: 'createme' } as DelegationEvent
    const imfine = { id: 'imfine' } as DelegationEvent
    expect(
      compare({ prev: [deleteme, imfine], next: [imfine, createme] })
    ).toEqual({
      create: [createme],
      delete: [deleteme],
    })
  })
})
