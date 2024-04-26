import { describe, test } from '@jest/globals'
import cascadeDelegators from './cascade'
import { Weights } from 'src/types'

describe('cascade', () => {
  test('simple linear delegation', () => {
    const dag: Weights<bigint> = {
      A: {
        B: BigInt(3),
      },
      B: {
        C: BigInt(100),
      },
    }

    expect(cascadeDelegators(dag)).toEqual({
      C: {
        A: BigInt(3),
        B: BigInt(100),
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

    expect(cascadeDelegators(dag)).toEqual({
      C: { A: 99n, B: 1000000000000n },
      D: { A: 1n, B: 1n },
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

    expect(cascadeDelegators(dag)).toEqual({
      B: { A: 50n },
      C: { A: 50n },
      F: { A: 1n, D: 3n },
      G: { A: 16n, D: 48n, E: 2n },
      H: { A: 16n, D: 49n, E: 2n },
    })
  })
})
