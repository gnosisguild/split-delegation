import { describe, test } from '@jest/globals'
import cascadeDelegators from './cascadeWeights'
import { Weights } from 'src/types'

describe('cascadeWeights', () => {
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
})
