import { describe, test } from '@jest/globals'
import { Address, parseUnits } from 'viem'

import formatDecimal from './formatDecimal'

describe('formatDecimal', () => {
  const A = 'A' as Address

  test('non-decimal number works', () => {
    expect(formatDecimal(12345)).toBe('12345')
  })

  test('decimal number works', () => {
    expect(formatDecimal(0.12345)).toBe('0.12345')
  })

  test('small decimal number works', () => {
    expect(formatDecimal(0.000000000000012345)).toBe('0.000000000000012345')
    const parsed = parseUnits(formatDecimal(0.000000000000012345), 18)
    expect(parsed).toBe(12345n)
  })
})
