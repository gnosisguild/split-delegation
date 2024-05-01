import { Address } from 'viem'

import {
  decodeDelegationUpdated,
  decodeExpirationUpdated,
  decodeOptOut,
  decodeSetClearDelegate,
  isClearDelegate,
  isDelegationCleared,
  isDelegationUpdated,
  isExpirationUpdated,
  isSetDelegate,
} from './decodeLog'

import { DelegationAction } from '@/src/types'

export default function parseRows(
  rows: {
    chainId: number
    registry: string
    account: string
    topics: string[]
    data: string
  }[]
): DelegationAction[] {
  return rows.map((row) => {
    const { chainId, registry, account } = row

    if (isSetDelegate(row)) {
      const { delegate } = decodeSetClearDelegate(row)
      return {
        chainId,
        registry: registry as Address,
        account: account as Address,
        set: { delegation: [{ delegate, ratio: 100n }], expiration: 0 },
      }
    }

    if (isClearDelegate(row)) {
      return {
        chainId,
        registry: registry as Address,
        account: account as Address,
        clear: { delegation: [], expiration: 0 },
      }
    }

    const base = {
      chainId,
      registry: registry as Address,
      account: account as Address,
    }

    if (isDelegationUpdated(row)) {
      const { delegation, expiration } = decodeDelegationUpdated(row)
      return { ...base, set: { delegation, expiration } }
    }

    if (isDelegationCleared(row)) {
      return { ...base, clear: { delegation: [], expiration: 0 } }
    }

    if (isExpirationUpdated(row)) {
      const { expiration } = decodeExpirationUpdated(row)
      return { ...base, expire: { expiration } }
    }

    const { optOut } = decodeOptOut(row)
    return { ...base, opt: { optOut } }
  })
}
