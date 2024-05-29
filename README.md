# Split Delegation

A general-purpose delegate registry.

## Features

- Delegate to multiple addresses (specify the percentage of your vote-weight for each).
- Cascading delegations (Delegate A -> Delegate B -> Delegate C = Delegate C's total voting power = A + B + C)
- Expiring delegations
- Automatic vote weight adjustment based on token balance changes.
- Delegation revocation at any time.

## Using with Snapshot

We Split-Delegation to be used with snapshot, and have integrated it into a corresponding snapshot strategy, so you can use this delegation registry natively in the Snapshot UI.

To integrate it into your Snapshot space, follow these steps:

1. Create a Snapshot space if you do not already have one
2. Choose the 'Split-Delegation' strategy during space creation, or select it in your space settings.

   - 'Split-Delegation' must be your only top-level strategy. In the parameters for this strategy, you can add more strategies that will be used as sub-strategies. Sub-strategies added here will be used to compute a score for any address that can then be combined with delegation weights to compute that address's total voting power. Move all of your existing strategies under Split-Delegation's `strategies` field (remove any existing delegation strategies).

   - For reference, here is an example of the JSON for a 'Split-Delegation' strategy:

   ```json
   {
     "name": "split-delegation",
     "params": {
       "backendUrl": "https://delegate-api.gnosisguild.org",
       "totalSupply": 1000000000, // denominated in ether NOT wei
       "strategies": [
         {
           "name": "erc20-balance-of",
           "params": {
             "symbol": "SAFE",
             "address": "0x5aFE3855358E112B5647B952709E6165e1c1eEEe",
             "decimals": 18
           },
           "network": 1
         }
       ]
     }
   }
   ```

   - `totalSupply` is used to display useful metrics in the Snapshot UI (e.g. percentage of vote or delegators controlled by one account), and is not used in final vote power calculations.

## Upgrading from existing Delegation Registry

Split-Delegation takes into account delegations made with the v1 contract, and can be used simultaneously with v1, allowing graceful upgrading. This means that delegations made on the v1 contract and on the Split-Delegation contract will be used when calculating total vote power. To use Split-Delegation, remove your existing delegation strategy when following the instructions above.

## Packages

### API

The `api` package is responsible for indexing, computing, caching and exposing each address's delegated voting power. It provides a set of API endpoints that allow you to interact with the delegate registry. It computes `voting power` based on `scores` and `weights` associated with an address.

#### Endpoints

Each endpoint has two identifying components in its path: `space` and `tag`. `Space` defines which snapshot space should be queried (e.g. safe.eth). `Tag` defines a time up to when the query should return. Possible values for `tag` are: a block number, a [viem blocktag](https://github.com/wevm/viem/blob/d946d55b8431b255c4cdc2d20e413f9064e7513a/src/types/block.ts#L86), or 'pin', which returns our cached value that updates every ten minutes. 'Pin' should be used in most cases, to reduce load on the server.

- `POST /api/v1/[space]/[tag]/top-delegates`
  - Query params:
    - `limit` - `number` - used for pagination, defaults to 100
    - `offset` - `number` - used for pagination, defaults to 0
    - `orderBy` - _required_ - must be either `power` or `count`. `Power` returns delegates sorted by voting power descending; `count` returns delegates sorted by amount of delegations descending.
  - Request body must contain a [valid split-delegation strategy](https://github.com/gnosisguild/split-delegation/blob/10ab7e91d87482a4d58d42d32ad777bc0cc476cb/packages/api/api/v1/types.ts#L14):
    ```
      {
        "strategy": {
          "name": "split-delegation",
          "network": "1",
          "params": {
            "delegationOverride": false
            "totalSupply": 1000000000000
            "strategies": [{
              "name": "erc20-balance-of",
              "params": {
                "symbol": "vCOW (mainnet)",
                "address": "0xd057b63f5e69cf1b929b356b579cba08d7688048",
                "decimals": 18
              },
              "network": "1"
            }]
          }
        }
      }
    ```
  - Return value:
    ```
    {
      "chainId": "1",
      "blockNumber": "19947439",
      "delegates": [
        {
          "address": "0x37F1eE65C2F8610741cd9Dff1057F926809C4078",
          "delegatorCount": 5,
          "percentOfDelegators": 600,
          "votingPower": 21.41231,
          "percentOfVotingPower": 211
        }...
      ]
    }
    ```
- `POST /api/v1/[space]/[tag]/[address]`

  - Request body must contain a [valid split-delegation strategy](https://github.com/gnosisguild/split-delegation/blob/10ab7e91d87482a4d58d42d32ad777bc0cc476cb/packages/api/api/v1/types.ts#L14):
    ```
      {
        "strategy": {
          "name": "split-delegation",
          "network": "1",
          "params": {
            "delegationOverride": false
            "totalSupply": 1000000000000
            "strategies": [{
              "name": "erc20-balance-of",
              "params": {
                "symbol": "vCOW (mainnet)",
                "address": "0xd057b63f5e69cf1b929b356b579cba08d7688048",
                "decimals": 18
              },
              "network": "1"
            }]
          }
        }
      }
    ```
  - Return value:

    ```
    {
      "chainId": "1",
      "blockNumber": "19947439",
      "address": "0x37F1eE65C2F8610741cd9Dff1057F926809C4078",
      "votingPower": 21.41231,
      "incomingPower": 21.41231,
      "outgoingPower": 10.00000,
      "percentOfVotingPower": 211,
      "percentOfDelegators": 600,
      delegators: [
        "0x485E60C486671E932fd9C53d4110cdEab1E7F0eb"
      ],
      delegatorTree [
        {
          "delegator": "0x485E60C486671E932fd9C53d4110cdEab1E7F0eb",
          "weight": 10000,
          "delegatedPower": 21.71540506,
          "parents": []
        }
      ],
      delegates [
        "0xD476B79539781e499396761CE7e21ab28AeA828F"
      ],
      delegateTree [
        {
          "delegate": "0xD476B79539781e499396761CE7e21ab28AeA828F",
          "weight": 5000,
          "delegatedPower": 10.00000,
          "parents": []
        }
      ],
    }
    ```

- `POST /api/v1/[space]/[tag]/voting-power`

  - Request body must contain a [valid split-delegation strategy](https://github.com/gnosisguild/split-delegation/blob/10ab7e91d87482a4d58d42d32ad777bc0cc476cb/packages/api/api/v1/types.ts#L14), and an array of addresses. This endpoint is designed to be consumed by Snapshot during the voting process.

    ```
      {
        "strategy": {
          "name": "split-delegation",
          "network": "1",
          "params": {
            "delegationOverride": false
            "totalSupply": 1000000000000
            "strategies": [{
              "name": "erc20-balance-of",
              "params": {
                "symbol": "vCOW (mainnet)",
                "address": "0xd057b63f5e69cf1b929b356b579cba08d7688048",
                "decimals": 18
              },
              "network": "1"
            }]
          }
        },
        addresses: [
          "0xD476B79539781e499396761CE7e21ab28AeA828F",
          "0x485E60C486671E932fd9C53d4110cdEab1E7F0eb",
          "0x37F1eE65C2F8610741cd9Dff1057F926809C4078",
        ]
      }
    ```

    - Return value:

    ```
    {
      "0x37F1eE65C2F8610741cd9Dff1057F926809C4078": 0,
      "0x485E60C486671E932fd9C53d4110cdEab1E7F0eb": 21.71540506,
      "0xD476B79539781e499396761CE7e21ab28AeA828F": 10.0000,,
    }
    ```

#### Key Terms

- _**Score**_ - value given to an address based on the sub-strategies applied to the Split-Delegation strategy.
  - For example: an `erc20-balance-of` strategy will return scores based on the amount of tokens an address holds
- _**Weight**_ - value given to an address based on delegations made to that address.
- _**Voting Power**_ - computed value given to an address using `score * weight`

### EVM

The `evm` package contains the Ethereum Virtual Machine (EVM) contracts for the delegate registry. These contracts are written in Solidity and can be deployed to any EVM-compatible blockchain. The package also includes a Hardhat configuration for compiling the contracts and running tests, as well as scripts for deploying the contracts and interacting with them on a blockchain.
