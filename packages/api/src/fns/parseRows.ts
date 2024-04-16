import { Address } from 'viem'
import { RegistryV2Event } from '@prisma/client'

import {
  decodeDelegationUpdated,
  decodeExpirationUpdated,
  decodeOptOut,
  isDelegationCleared,
  isDelegationUpdated,
  isExpirationUpdated,
} from './decodeLog'
import { DelegationEvent } from '../types'

export default function parseRows(rows: RegistryV2Event[]): DelegationEvent[] {
  return rows.map((row) => {
    const { chainId, registry, space, account } = row

    const base = {
      chainId,
      registry: registry as Address,
      space,
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
