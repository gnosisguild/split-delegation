import { describe, test } from '@jest/globals'
import { Address } from 'viem'
import bfs from './bfs'

describe('bfs', () => {
  const A = 'A' as Address
  const B = 'B' as Address
  const C = 'C' as Address
  const D = 'D' as Address

  test('case 1', () => {
    const weights = {
      [A]: {
        [B]: 20n,
        [C]: 80n,
      },
      [B]: {
        [D]: 100n,
      },
    }

    expect(bfs(weights, A)).toEqual([B, C, D])
    expect(bfs(weights, B)).toEqual([D])
    expect(bfs(weights, C)).toEqual([])
    expect(bfs(weights, D)).toEqual([])
  })

  test('case 2', () => {
    const weights = {
      [A]: {
        [B]: 50n,
        [C]: 50n,
      },
      [B]: {
        [D]: 100n,
      },
      [C]: {
        [D]: 100n,
      },
    }

    expect(bfs(weights, A)).toEqual([B, C, D])
    expect(bfs(weights, B)).toEqual([D])
    expect(bfs(weights, C)).toEqual([D])
    expect(bfs(weights, D)).toEqual([])
  })
})
