import { describe, test } from '@jest/globals'
import createDelegateDAG from './createDelegateDAG'
import { Graph } from 'src/graph/types'

describe('createDelegateDAG', () => {
  test('simple linear delegation', () => {
    const dag: Graph<bigint> = {
      A: {
        B: BigInt(3),
      },
      B: {
        C: BigInt(100),
      },
    }

    expect(createDelegateDAG(dag)).toEqual({
      C: {
        A: BigInt(3),
        B: BigInt(100),
      },
    })
  })

  test('C gets A from two differences become properly combined', () => {
    const dag: Graph<bigint> = {
      A: {
        B: BigInt(50),
        C: BigInt(50),
      },
      B: {
        C: BigInt(1000000000000),
        D: BigInt(1),
      },
    }

    expect(createDelegateDAG(dag)).toEqual({
      C: { A: 99n, B: 1000000000000n },
      D: { A: 1n, B: 1n },
    })
  })
})
