import assert from 'assert'
import { Address } from 'viem'

import { DelegationEvent } from 'src/types'
import { Registry } from './types'

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
export default function (events: DelegationEvent[]): Registry {
  const fullRegistry = events.reduce(reduceEvent, {})
  const registry = selectEffectiveVenue(fullRegistry)
  return registry
}

type State = Record<Address, Slice>

type Slice = {
  venueId: string
  venues: Record<string, Venue>
}

type Venue = {
  chainId: number
  registry: Address
  space: string
  account: Address
  delegation: { delegate: Address; ratio: bigint }[]
  expiration: number
  optOut: boolean
}

function reduceEvent(state: State, event: DelegationEvent): State {
  const account = event.account

  const venueId = `${event.chainId}-${event.registry}`
  const slice = state[account] || {
    venueId,
    venues: {},
  }

  const venue = slice.venues[venueId] || {
    delegation: [],
    expiration: 0,
    optOut: false,
  }

  let nextVenueId = slice.venueId
  let overrides
  if ('set' in event) {
    nextVenueId = venueId
    overrides = event.set
  } else if ('clear' in event) {
    overrides = event.clear
  } else if ('expire' in event) {
    overrides = event.expire
  } else {
    assert('opt' in event)
    overrides = event.opt
  }

  return {
    ...state,
    [account]: {
      venueId: nextVenueId,
      venues: {
        ...slice.venues,
        [venueId]: { ...venue, ...overrides },
      },
    },
  }
}

function selectEffectiveVenue(
  registry: Record<string, { venueId: string; venues: Record<string, Venue> }>
): Registry {
  return Object.keys(registry).reduce((result, account) => {
    const { venueId, venues } = registry[account as Address]
    assert(venueId && venues[venueId])

    const { delegation, expiration, optOut } = venues[venueId]

    assert(Array.isArray(delegation))
    assert(typeof expiration == 'number')
    assert(typeof optOut == 'boolean')
    return {
      ...result,
      [account]: { delegation, expiration, optOut },
    }
  }, {})
}
