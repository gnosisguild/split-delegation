import { describe, test } from '@jest/globals'
import { Log, getAddress, stringToHex } from 'viem'

import spaceId from './spaceId'

import {
  decodeDelegationUpdated,
  decodeOptOut,
  decodeSetClearDelegate,
  isClearDelegate,
  isDelegationCleared,
  isDelegationUpdated,
  isExpirationUpdated,
  isOptOut,
  isSetDelegate,
} from './decodeLog'

describe('decodeLog', () => {
  test('event SetDelegate', () => {
    const log = {
      address: '0x469788fe6e9e9681c6ebf3bf78e7fd26fc015446',
      topics: [
        '0xa9a7fd460f56bddb880a465a9c3e9730389c70bc53108148f16d55a87a6c468e',
        '0x000000000000000000000000c8381ca290c198f5ab739a1841ce8aedb0b330d5',
        '0x6c69646f2d736e617073686f742e657468000000000000000000000000000000',
        '0x000000000000000000000000f138823639686a85a43971dd9a2c8f6c15279b2e',
      ],
      data: '0x',
      blockNumber: 11855791n,
      transactionHash:
        '0x8fff6707bcbd53e93970cf12c5f317ce37ea24dfe28f707b2fa45dfc7a7ddcc5',
      transactionIndex: 19,
      blockHash:
        '0x25f53cc86f3ed4d29bde95c46678dae3e87861863eef520b4906ec34aecefb3a',
      logIndex: 28,
      removed: false,
    }

    expect(isSetDelegate(log)).toEqual(true)
    expect(isClearDelegate(log)).toEqual(false)

    expect(isDelegationUpdated(log)).toEqual(false)
    expect(isDelegationCleared(log)).toEqual(false)
    expect(isExpirationUpdated(log)).toEqual(false)
    expect(isOptOut(log)).toEqual(false)

    const { account, spaceId, delegate } = decodeSetClearDelegate(log)

    expect(spaceId).toEqual(stringToHex('lido-snapshot.eth', { size: 32 }))
    expect(account).toEqual(
      getAddress('0xc8381ca290c198f5ab739a1841ce8aedb0b330d5')
    )
    expect(delegate).toEqual(
      getAddress('0xf138823639686a85a43971dd9a2c8f6c15279b2e')
    )
  })
  test('event ClearDelegate', () => {
    const log = {
      address: '0x469788fe6e9e9681c6ebf3bf78e7fd26fc015446',
      topics: [
        '0x9c4f00c4291262731946e308dc2979a56bd22cce8f95906b975065e96cd5a064',
        '0x00000000000000000000000056bb3a51c2d20c60fed183d930ac6297d0101bfa',
        '0x6376782e65746800000000000000000000000000000000000000000000000000',
        '0x000000000000000000000000947b7742c403f20e5faccdac5e092c943e7d0277',
      ],
      data: '0x',
      blockNumber: 13627420n,
      transactionHash:
        '0x5a60cf8f8d42bec44dd0dd47a810a36d3165703ecec7a3bec49a82622d5c6e69',
      transactionIndex: 188,
      blockHash:
        '0xfc83ff352ef3c526d91be4015533efb25fb44da6c57b01e025543404422dda45',
      logIndex: 257,
      removed: false,
    }

    expect(isSetDelegate(log)).toEqual(false)
    expect(isClearDelegate(log)).toEqual(true)

    expect(isDelegationUpdated(log)).toEqual(false)
    expect(isDelegationCleared(log)).toEqual(false)
    expect(isExpirationUpdated(log)).toEqual(false)
    expect(isOptOut(log)).toEqual(false)

    const { account, spaceId, delegate } = decodeSetClearDelegate(log)
    expect(spaceId).toEqual(stringToHex('cvx.eth', { size: 32 }))
    expect(account).toEqual(
      getAddress('0x56bb3a51c2d20c60fed183d930ac6297d0101bfa')
    )
    expect(delegate).toEqual(
      getAddress('0x947b7742c403f20e5faccdac5e092c943e7d0277')
    )
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
        weight: 40,
      },
    ])
    expect(expiration).toEqual(1876538446)
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
