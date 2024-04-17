import { describe, test } from '@jest/globals'
import { Log, getAddress, stringToHex } from 'viem'

import spaceId from './spaceId'

import {
  decodeDelegationUpdated,
  decodeLog,
  decodeOptOut,
  isDelegationCleared,
  isDelegationUpdated,
  isExpirationUpdated,
  isOptOut,
} from './decodeLog'

describe('decodeLog', () => {
  test('from raw', () => {
    const topics = [
      '0xa9a7fd460f56bddb880a465a9c3e9730389c70bc53108148f16d55a87a6c468e',
      '0x000000000000000000000000ef8305e140ac520225daf050e2f71d5fbcc543e7',
      '0x676e6f7369730000000000000000000000000000000000000000000000000000',
      '0x0000000000000000000000004c7909d6f029b3a5798143c843f4f8e5341a3473',
    ]

    expect(decodeLog({ topics, data: '0x' })).not.toThrow
  })

  test('event DelegationUpdated', () => {
    const log = {
      address: '0xde1e8a7e184babd9f0e3af18f40634e9ed6f0905',
      topics: [
        '0xbbfaebc0e35c81daa40cc3d21316def67a6456e2b1c91d5f8ad1de9b721de37b',
        '0x00000000000000000000000067a16655c1c46f8822726e989751817c49f29054',
      ],
      data: '0x000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000006fd9b44e000000000000000000000000000000000000000000000000000000000000000a676e6f7369732e65746800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000006cc5b30cd0a93c1f85c7868f5f2620ab8c4581900000000000000000000000000000000000000000000000000000000000000028',
      blockNumber: '8500987',
      transactionHash:
        '0xac0478d0891583e096e541bf5269f4f359478538e8e4389f018d865878ae5f7f',
      transactionIndex: 66,
      blockHash:
        '0x922d6299e10d0ffd5729788426bd4011b9bab4c74cf6824b9c841192ffe8a585',
      logIndex: 761,
      removed: false,
    } as unknown as Log

    expect(isDelegationUpdated(log)).toEqual(true)
    expect(isDelegationCleared(log)).toEqual(false)
    expect(isExpirationUpdated(log)).toEqual(false)
    expect(isOptOut(log)).toEqual(false)

    const { account, spaceId, delegation, expiration } =
      decodeDelegationUpdated(log)

    expect(account).toEqual(
      getAddress('0x67A16655c1c46f8822726e989751817c49f29054')
    )
    expect(spaceId).toEqual(stringToHex('gnosis.eth', { size: 32 }))
    expect(delegation).toEqual([
      {
        delegate: getAddress('0x6cc5b30Cd0A93C1F85C7868f5F2620AB8c458190'),
        ratio: BigInt(40),
      },
    ])
  })
  describe.skip('event DelegationUpdated', () => {})
  describe.skip('event DelegationCleared', () => {})

  test('event OptOutStatusSet', () => {
    const log = {
      address: '0xde1e8a7e184babd9f0e3af18f40634e9ed6f0905',
      topics: [
        '0x7e87855f33013e8d674833df5eab0f65055b248901ff9059f5482da853f76347',
        '0x00000000000000000000000053bcfaed43441c7bb6149563ec11f756739c9f6a',
      ],
      data: '0x0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000047465737400000000000000000000000000000000000000000000000000000000',
      blockNumber: '8490410',
      transactionHash:
        '0x68f0323f82a61c419d16d8babc324622ad4f0bbca571414ac5cb9d2d31a0fd03',
      transactionIndex: 71,
      blockHash:
        '0x11d8a8f476e1ffe6e6fd241d2f308c6616b5d97b1f43f5452fe5f562b885cf20',
      logIndex: 228,
      removed: false,
    } as unknown as Log

    expect(isDelegationUpdated(log)).toEqual(false)
    expect(isDelegationCleared(log)).toEqual(false)
    expect(isExpirationUpdated(log)).toEqual(false)
    expect(isOptOut(log)).toEqual(true)

    const { account, spaceId: _spaceId, optOut } = decodeOptOut(log)

    expect(account).toEqual(
      getAddress('0x53bcfaed43441c7bb6149563ec11f756739c9f6a')
    )
    expect(_spaceId).toEqual(stringToHex('test', { size: 32 }))
    expect(_spaceId).toEqual(spaceId('test'))
    expect(optOut).toEqual(true)
  })
})
