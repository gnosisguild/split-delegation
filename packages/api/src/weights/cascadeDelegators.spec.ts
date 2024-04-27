import { describe, test } from '@jest/globals'
import cascade2 from './cascadeDelegators'
import { Weights } from 'src/types'

describe('cascadeDelegators', () => {
  test('simple linear delegation', () => {
    const dag: Weights<bigint> = {
      A: {
        B: BigInt(3),
      },
      B: {
        C: BigInt(100),
      },
    }

    expect(cascade2(dag)).toEqual({
      A: {
        C: BigInt(3),
      },
      B: {
        C: BigInt(100),
      },
    })
  })

  test('C gets A from two differences become properly combined', () => {
    const dag: Weights<bigint> = {
      A: {
        B: BigInt(50),
        C: BigInt(50),
      },
      B: {
        C: BigInt(1000000000000),
        D: BigInt(1),
      },
    }

    expect(cascade2(dag)).toEqual({
      A: {
        C: BigInt(99),
        D: BigInt(1),
      },
      B: {
        C: BigInt(1000000000000),
        D: BigInt(1),
      },
    })
  })

  test('three level delegation', () => {
    const dag: Weights<bigint> = {
      A: {
        B: BigInt(50),
        C: BigInt(50),
        D: BigInt(33),
      },
      D: {
        E: BigInt(97),
        F: BigInt(3),
      },
      E: {
        G: BigInt(2),
        H: BigInt(2),
      },
    }

    expect(cascade2(dag)).toEqual({
      A: {
        B: 50n,
        C: 50n,
        F: 1n,
        G: 16n,
        H: 16n,
      },
      D: {
        F: 3n,
        G: 48n,
        H: 49n,
      },
      E: {
        G: 2n,
        H: 2n,
      },
    })
  })
})
