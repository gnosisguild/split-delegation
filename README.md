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
       "totalSupply": 1000000000, // in Ether NOT wei
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

## Upgrading from existing Delegation Registry

Split-Delegation takes into account delegations made with the v1 contract, and can be used simultaneously with v1, allowing graceful upgrading. This means that delegations made on the v1 contract and on the Split-Delegation contract will be used when calculating total vote power. To use Split-Delegation, remove your existing delegation strategy when following the instructions above.

## Packages

### API

The `api` package is responsible for indexing, computing, caching and exposing each address's delegated voting power. It provides a set of API endpoints that allow you to interact with the delegate registry. It computes `voting power` based on `scores` and `weights` associated with an address.

#### Key Terms

- _**Score**_ - value given to an address based on the sub-strategies applied to the Split-Delegation strategy.
  - For example: an `erc20-balance-of` strategy will return scores based on the amount of tokens an address holds
- _**Weight**_ - value given to an address based on delegations made to that address.
- _**Voting Power**_ - computed value given to an address using `score * weight`

### EVM

The `evm` package contains the Ethereum Virtual Machine (EVM) contracts for the delegate registry. These contracts are written in Solidity and can be deployed to any EVM-compatible blockchain. The package also includes a Hardhat configuration for compiling the contracts and running tests, as well as scripts for deploying the contracts and interacting with them on a blockchain.
