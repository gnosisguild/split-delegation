import { Address, Hash } from 'viem'
import { DelegationEvent } from '@prisma/client'

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

import { DelegationAction } from 'src/types'

export default function parseRows(rows: DelegationEvent[]): DelegationAction[] {
  return rows.map((row) => {
    const { chainId, registry, account } = row

    const base = {
      chainId,
      registry: registry as Address,
      account: account as Address,
    }

    if (isSetDelegate(row)) {
      const { delegate } = decodeSetClearDelegate(row)
      return {
        ...base,
        set: { delegation: [{ delegate, ratio: 100n }], expiration: 0 },
      }
    }

    if (isDelegationUpdated(row)) {
      const { delegation, expiration } = decodeDelegationUpdated(row)
      return { ...base, set: { delegation, expiration } }
    }

    if (isClearDelegate(row)) {
      return { ...base, clear: { delegation: [], expiration: 0 } }
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
