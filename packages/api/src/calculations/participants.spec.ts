import { describe, test } from '@jest/globals'
import { Address } from 'viem'
import { allDelegates, allDelegators } from './participants'

describe('allDelegators', () => {
  const A = 'A' as Address
  const B = 'B' as Address
  const C = 'C' as Address
  const D = 'D' as Address

  test('it collects all delegators', () => {
    const delegations = {
      [A]: {
        incoming: [],
        outgoing: [{ address: C, direct: true, ratio: 0, weight: 0 }],
      },
      [B]: {
        incoming: [],
        outgoing: [{ address: C, direct: true, ratio: 0, weight: 0 }],
      },
    }

    const delegators = allDelegators(delegations)

    expect(delegators).toEqual([A, B])
  })

  test('it only includes entries that have outgoing edges', () => {
    const delegations = {
      [A]: {
        incoming: [],
        outgoing: [{ address: C, direct: true, ratio: 0, weight: 0 }],
      },
      [C]: {
        incoming: [{ address: A, direct: true, ratio: 0, weight: 0 }],
        outgoing: [],
      },
      [D]: {
        incoming: [{ address: B, direct: true, ratio: 0, weight: 0 }],
        outgoing: [],
      },
      ['E']: {
        incoming: [],
        outgoing: [],
      },
    }

    const delegators = allDelegators(delegations)
    expect(delegators).toEqual([A])
  })
})

describe('allDelegates', () => {
  const A = 'A' as Address
  const B = 'B' as Address
  const C = 'C' as Address
  const D = 'D' as Address
  const E = 'E' as Address

  test('it collects all delegates', () => {
    const delegations = {
      [A]: {
        incoming: [],
        outgoing: [{ address: C, direct: true, ratio: 0, weight: 0 }],
      },
      [B]: {
        incoming: [],
        outgoing: [{ address: C, direct: false, ratio: 0, weight: 0 }],
      },
    }

    const delegates = allDelegates(delegations)

    expect(delegates).toEqual([C])
  })

  test('it only includes entries that have incoming edges', () => {
    const delegations = {
      [A]: {
        incoming: [],
        outgoing: [{ address: C, direct: true, ratio: 0, weight: 0 }],
      },
      [C]: {
        incoming: [{ address: A, direct: true, ratio: 0, weight: 0 }],
        outgoing: [{ address: E, direct: true, ratio: 0, weight: 0 }],
      },
      [D]: {
        incoming: [{ address: B, direct: true, ratio: 0, weight: 0 }],
        outgoing: [{ address: E, direct: false, ratio: 0, weight: 0 }],
      },
      [E]: {
        incoming: [],
        outgoing: [],
      },
    }

    const delegates = allDelegates(delegations)
    expect(delegates).toEqual([C, E])
  })
})
