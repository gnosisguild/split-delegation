import assert from 'assert'
import { Address } from 'viem'

import { DelegationAction, Registry } from '../types'

/**
 * Consolidates DelegationEvents into a unified registry view. These events can come
 * from various registry versions (V1/V2) and networks. This function reduces events
 * into distinct buckets, referred to as venues. Only the effective venue is
 * included in the output.
 *
 * The effective is determined through set operations. For instance, when mainnet-V1
 * is the relevant one, a clear operation in a sidechain will not affect the result.
 *
 * @param {DelegationEvent[]} events - DelegationEvents sorted by source block timestamp.
 * @returns {Registry} - Unified registry view.
 */
export default function (actions: DelegationAction[]): Registry {
  const [registry] = [actions]
    .map((actions) => actions.reduce(reducer, {}))
    .map((fullRegistry) => selectEffectiveVenue(fullRegistry))

  return registry
}

type State = Record<Address, Slice>

type Slice = {
  venueId: string
  venues: Record<string, Venue>
}

type Venue = {
  delegation: { delegate: Address; ratio: bigint }[]
  expiration: number
  optOut: boolean
}

function reducer(state: State, action: DelegationAction): State {
  const account = action.account
  const venueId = `${action.chainId}-${action.registry}`

  // THIS IS SLOW
  // return {
  //   ...state,
  //   [account]: {
  //     venueId: nextVenueId,
  //     venues: {
  //       ...slice.venues,
  //       [venueId]: { ...venue, ...overrides },
  //     },
  //   },
  // }

  if (!state[account]) {
    state[account] = {
      venueId,
      venues: {},
    }
  }
  if (!state[account].venues[venueId]) {
    state[account].venues[venueId] = {
      delegation: [],
      expiration: 0,
      optOut: false,
    }
  }

  let overrides
  if ('set' in action) {
    state[account].venueId = venueId
    overrides = action.set
  } else if ('clear' in action) {
    overrides = action.clear
  } else if ('expire' in action) {
    overrides = action.expire
  } else {
    assert('opt' in action)
    overrides = action.opt
  }

  state[account].venues[venueId] = {
    ...state[account].venues[venueId],
    ...overrides,
  }

  return state
}

function selectEffectiveVenue(
  registry: Record<string, { venueId: string; venues: Record<string, Venue> }>
): Registry {
  const result: Record<string, Venue> = {}
  for (const account of Object.keys(registry)) {
    const { venueId, venues } = registry[account]
    const { delegation, expiration, optOut } = venues[venueId]
    result[account] = { delegation, expiration, optOut }
  }
  return result
}
