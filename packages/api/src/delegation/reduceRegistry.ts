import assert from 'assert'
import { Address } from 'viem'

import { DelegationEvent, EventKind } from 'src/types'

export default function (
  events: DelegationEvent[],
  now: number
): Record<Address, RegistryEntry> {
  const [registry] = [events.reduce(reduceEvent, {})]
    .map((registry) => selectEffectiveVenue(registry))
    .map((registry) => filterExpired(registry, now))
    .map((registry) => filterOptOuts(registry))

  return registry
}

function reduceEvent(
  state: Record<Address, Slice>,
  event: DelegationEvent
): Record<Address, Slice> {
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

  const sliceNext = {
    ...slice,
    venueId: event.kind == EventKind.SET ? venueId : slice.venueId,
    venues: {
      ...slice.venues,
      [venueId]: { ...venue, ...event },
    },
  }

  return {
    ...state,
    [account]: sliceNext,
  }
}

function selectEffectiveVenue(
  registry: Record<
    string,
    { venueId: string; venues: Record<string, RegistryEntry> }
  >
): Record<string, RegistryEntry> {
  return Object.keys(registry).reduce((result, account) => {
    const { venueId, venues } = registry[account as Address]

    assert(venueId && venues[venueId])
    return {
      ...result,
      [account]: venues[venueId] as RegistryEntry,
    }
  }, {})
}

function filterOptOuts(
  registry: Record<string, RegistryEntry>
): Record<string, RegistryEntry> {
  const optedOut = new Set(
    Object.keys(registry).filter((account) => registry[account].optOut == true)
  )

  if (optedOut.size == 0) {
    return registry
  }

  return Object.keys(registry).reduce((result, key) => {
    return {
      ...result,
      [key]: {
        ...registry[key],
        delegation: registry[key].delegation.filter(
          ({ delegate }) => optedOut.has(delegate) == false
        ),
      },
    }
  }, {})
}

function filterExpired(
  registry: Record<string, RegistryEntry>,
  now: number
): Record<string, RegistryEntry> {
  return Object.keys(registry).reduce((result, key) => {
    const { expiration } = registry[key]

    if (expiration != 0 && now > expiration) {
      return result
    }
    return {
      ...result,
      [key]: registry[key],
    }
  }, {})
}

export type RegistryEntry = {
  chainId: number
  registry: Address
  space: string
  account: Address
  delegation: { delegate: Address; ratio: bigint }[]
  expiration: number
  optOut: boolean
}

type Slice = {
  venueId: string
  venues: Record<string, RegistryEntry>
}
