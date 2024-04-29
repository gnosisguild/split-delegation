# Split Delegation

A general-purpose delegate registry.

## Features

- Delegate to multiple addresses (specify the percentage of your vote-weight for each).
- Cascading delegations (Delegate A -> Delegate B -> Delegate C = Delegate C's total voting power = A + B + C)
- Expiring delegations
- Automatic vote weight adjustment based on token balance changes.
- Delegation revocation at any time.

## Packages

### API

The `api` package is responsible for indexing, computing, caching and exposing each address's delegated voting power. It provides a set of API endpoints that allow you to interact with the delegate registry.

### EVM

The `evm` package contains the Ethereum Virtual Machine (EVM) contracts for the delegate registry. These contracts are written in Solidity and can be deployed to any EVM-compatible blockchain. The package also includes a Hardhat configuration for compiling the contracts and running tests, as well as scripts for deploying the contracts and interacting with them on a blockchain.
