import assert from 'assert'
import {
  Hash,
  Log,
  Hex,
  decodeAbiParameters,
  parseAbiParameters,
  getAddress,
} from 'viem'
import {
  isDelegationCleared,
  isDelegationUpdated,
  isExpirationUpdated,
  isOptOut,
} from './logTopics'

export default function parseLogs(logs: Log[]) {}

export function parseDelegationUpdated({
  topics,
  data,
}: {
  topics: string[]
  data: string
}) {
  assert(isDelegationUpdated({ topics, data }))

  const [, accountAsTopic] = topics as Hash[]

  const [account] = decodeAbiParameters([{ type: 'address' }], accountAsTopic)
  const [context, , delegation, expiration] = decodeAbiParameters(
    parseAbiParameters(
      'string, (address,uint256)[], (address,uint256)[], uint256'
    ),
    data as Hex
  )

  return {
    account,
    space: context,
    delegation: delegation.map(([delegate, ratio]) => ({
      delegate: getAddress(delegate),
      ratio,
    })),
    expiration,
  }
}

export function parseDelegationCleared({
  topics,
  data,
}: {
  topics: string[]
  data: string
}) {
  assert(isDelegationCleared({ topics, data }))

  const [, accountAsTopic] = topics as Hash[]

  const [account] = decodeAbiParameters([{ type: 'address' }], accountAsTopic)
  const [context] = decodeAbiParameters(
    parseAbiParameters('string, (address,uint256)[]'),
    data as Hex
  )

  return {
    account,
    space: context,
  }
}

export function parseExpirationUpdated({
  topics,
  data,
}: {
  topics: string[]
  data: string
}) {
  assert(isExpirationUpdated({ topics, data }))

  const [, accountAsTopic] = topics as Hash[]

  const [account] = decodeAbiParameters([{ type: 'address' }], accountAsTopic)
  const [context, , expiration] = decodeAbiParameters(
    parseAbiParameters('string, (address,uint256)[], uint256'),
    data as Hex
  )

  return {
    account,
    space: context,
    expiration,
  }
}

export function parseOptOut({
  topics,
  data,
}: {
  topics: string[]
  data: string
}) {
  assert(isOptOut({ topics, data }))

  const [, accountAsTopic] = topics as Hash[]

  const [account] = decodeAbiParameters([{ type: 'address' }], accountAsTopic)
  const [context, optOut] = decodeAbiParameters(
    parseAbiParameters('string, bool'),
    data as Hex
  )

  return {
    account,
    space: context,
    optOut,
  }
}
