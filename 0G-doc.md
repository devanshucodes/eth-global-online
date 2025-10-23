
# 0G Network: Complete Developer Documentation

Welcome to the 0G Network documentation. This guide is designed to provide a comprehensive, step-by-step, and well-aligned reference for developers, validators, and users building on the 0G decentralized AI and blockchain platform.

---

## Introduction

0G is a modular, decentralized infrastructure for AI and blockchain. It enables:
- Building and deploying dApps on EVM-compatible and non-EVM chains
- Running validators and participating in consensus
- Integrating AI inference and fine-tuning via decentralized GPU compute
- Storing and retrieving massive datasets with decentralized storage

---

## Network Details

### Testnet (Galileo)
- **Network Name:** 0G-Galileo-Testnet
- **Chain ID:** 16601
- **Token Symbol:** OG
- **Block Explorer:** [chainscan-galileo.0g.ai](https://chainscan-galileo.0g.ai)
- **Faucet:** [faucet.0g.ai](https://faucet.0g.ai)
- **RPC:** https://evmrpc-testnet.0g.ai
- **3rd Party RPCs:** QuickNode, ThirdWeb, Ankr

### Mainnet
- **Network Name:** 0G Mainnet
- **Chain ID:** 16661
- **Token Symbol:** 0G
- **Block Explorer:** [chainscan.0g.ai](https://chainscan.0g.ai)
- **RPC:** https://evmrpc.0g.ai

---

## Quick Links
- [Testnet Block Explorer](https://chainscan-galileo.0g.ai)
- [Testnet Faucet](https://faucet.0g.ai)
- [Mainnet Block Explorer](https://chainscan.0g.ai)
- [GitHub](https://github.com/0gfoundation)
- [Discord](https://discord.gg/0gfoundation)

---

## Network Details

### Testnet (Galileo)
- **Network Name:** 0G-Galileo-Testnet
- **Chain ID:** 16601
- **Token Symbol:** OG
- **Block Explorer:** https://chainscan-galileo.0g.ai
- **Faucet:** https://faucet.0g.ai
- **3rd Party RPCs:** QuickNode, ThirdWeb, Ankr

### Mainnet
- **Network Name:** 0G Mainnet
- **Chain ID:** 16661
- **Token Symbol:** 0G
- **Block Explorer:** https://chainscan.0g.ai
- **3rd Party RPCs:** QuickNode, ThirdWeb, Ankr

---


## Getting Started

### 1. Add Network to Wallet
- Remove any old 0G testnet configurations before adding Galileo.
- Add to MetaMask or OKX Wallet using the network details above.

### 2. Get Test Tokens
- Visit the [0G Faucet](https://faucet.0g.ai) to receive free testnet tokens (0.1 OG per wallet per day).

### 3. Start Building
- Deploy Smart Contracts (EVM compatible)
- Use Storage SDK (Go/TypeScript)
- Access Compute Network (AI inference/fine-tuning)
- Integrate DA Layer

---

## Contract Addresses

### Testnet
- **0G Storage**
  - Flow: `0xbD75117F80b4E22698D0Cd7612d92BDb8eaff628`
  - Mine: `0x3A0d1d67497Ad770d6f72e7f4B8F0BAbaa2A649C`
  - Market: `0x53191725d260221bBa307D8EeD6e2Be8DD265e19`
  - Reward: `0xd3D4D91125D76112AE256327410Dd0414Ee08Cb4`
- **0G DA**
  - DAEntrance: `0xE75A073dA5bb7b0eC622170Fd268f35E675a957B`
  - Deployment Block: 326165
- **Staking Contract:** `0xea224dBB52F57752044c0C86aD50930091F561B9`

---


## Developer Tools

- **Block Explorers:** View transactions, blocks, and smart contracts
- **Storage Explorer:** Track storage operations and metrics
- **Validator Dashboard:** Monitor network validators
- **Development RPC:** For dApp and contract development
- **Faucet:** Request test tokens for testnet

---

## Building on 0G

0G supports:
- **EVM Chains:** Ethereum, Polygon, BNB, Arbitrum, etc.
- **Non-EVM Chains:** Solana, Near, Cosmos
- **Web2 Applications:** Integrate decentralized AI/storage into traditional apps

### Prerequisites
1. Get testnet tokens from the faucet
2. Install the relevant SDK for your language (see below)
3. Review service documentation for your chosen components

---


## Deploying Smart Contracts

### Prerequisites
- Node.js 16+ (for Hardhat/Truffle)
- Rust (for Foundry)
- Wallet with testnet OG tokens
- Basic Solidity knowledge

### Step-by-Step Guide
1. **Write Your Contract**
   - Use Solidity 0.8.19+ for best compatibility
   - Example:
     ```solidity
     // SPDX-License-Identifier: MIT
     pragma solidity ^0.8.19;
     contract MyToken {
         mapping(address => uint256) public balances;
         uint256 public totalSupply;
         constructor(uint256 _initialSupply) {
             totalSupply = _initialSupply;
             balances[msg.sender] = _initialSupply;
         }
         function transfer(address to, uint256 amount) public returns (bool) {
             require(balances[msg.sender] >= amount, "Insufficient balance");
             balances[msg.sender] -= amount;
             balances[to] += amount;
             return true;
         }
     }
     ```
2. **Compile**
   - With solc:
     ```bash
     solc --evm-version cancun --bin --abi MyToken.sol
     ```
   - With Hardhat:
     ```js
     module.exports = {
       solidity: {
         version: "0.8.19",
         settings: {
           evmVersion: "cancun",
           optimizer: { enabled: true, runs: 200 }
         }
       }
     };
     ```
   - With Foundry:
     ```toml
     [profile.default]
     evm_version = "cancun"
     ```
3. **Deploy**
   - Configure your deployment tool (Hardhat, Foundry, Truffle) to use the 0G RPC endpoint.
   - Example Hardhat network config:
     ```js
     networks: {
       "0g-testnet": {
         url: "https://evmrpc-testnet.0g.ai",
         chainId: 16601,
         accounts: [process.env.PRIVATE_KEY]
       }
     }
     ```
   - Deploy using your preferred tool.
4. **Verify Deployment**
   - Use [chainscan-galileo.0g.ai](https://chainscan-galileo.0g.ai) to view and verify your contract.

---


## Staking & Delegation

0G enables OG token holders to participate in consensus and earn rewards by:
- **Running a Validator:** Operate infrastructure to validate transactions and produce blocks
- **Delegating to Validators:** Stake tokens with existing validators

### Key Contracts
- **IStakingContract:** Central registry for validators and global staking parameters
- **IValidatorContract:** Individual validator operations (delegation, rewards)

### Example: Creating a Validator
```solidity
IStakingContract staking = IStakingContract(0xea224dBB52F57752044c0C86aD50930091F561B9);
address validator = staking.createAndInitializeValidatorIfNecessary{value: msg.value}(
  description, commissionRate, withdrawalFee, pubkey, signature
);
```

#### Steps to Become a Validator
1. Generate validator keys (see node setup docs)
2. Compute validator address
3. Generate signature for initialization
4. Call `createAndInitializeValidatorIfNecessary` with your details

#### Delegation Example
```solidity
IValidatorContract(validator).delegate{value: msg.value}(msg.sender);
```

#### Querying Delegation Info
```solidity
uint shares;
uint estimatedTokens;
(, shares) = v.getDelegation(delegator);
uint totalTokens = v.tokens();
uint totalShares = v.delegatorShares();
if (totalShares > 0) {
  estimatedTokens = (shares * totalTokens) / totalShares;
}
```

---


## Precompiles

Precompiles are special contracts at fixed addresses that provide native features:

### DASigners (0x0000000000000000000000000000000000001000)
- Manage DA node signers
- Query quorum info
- Verify data availability proofs

### WrappedOGBase (0x0000000000000000000000000000000000001002)
- ERC20-compatible wrapped OG token
- Mint/burn quotas

---


## Compute Network & SDK

The 0G Compute Network is a decentralized GPU marketplace for AI workloads. It enables:
- **AI Inference:** Run LLMs and other models on demand
- **Fine-tuning:** Customize models with your data
- **Training:** (Coming soon)

### Features
- 90% cheaper than cloud
- Verifiable computation (TEE)
- Pay only for compute used

### SDK Quick Start
```bash
pnpm add @0glabs/0g-serving-broker @types/crypto-js@4.2.2 crypto-js@4.2.0
```

#### Initialize Broker
```js
import { ethers } from "ethers";
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";
const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
const broker = await createZGComputeNetworkBroker(wallet);
```

#### Fund Account
```js
await broker.ledger.addLedger("0.1");
```

#### Discover Services
```js
const services = await broker.inference.listService();
```

#### Send Inference Request
```js
const { endpoint, model } = await broker.inference.getServiceMetadata(provider);
const headers = await broker.inference.getRequestHeaders(provider, question);
const response = await fetch(`${endpoint}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({
      messages: [{ role: "user", content: question }],
      model: model,
    }),
  });
const data = await response.json();
const answer = data.choices[0].message.content;
```

#### Account Management
- Check balance, add funds, withdraw unused funds, and monitor usage via the SDK.

---


## Fine-tuning CLI

Fine-tune AI models with your own data using the 0G distributed GPU network.

### Prerequisites
- Node.js >= 22.0.0

### Install CLI
```bash
pnpm install @0glabs/0g-serving-broker -g
```

### Set Environment
```bash
export RPC_ENDPOINT=https://evmrpc-testnet.0g.ai
export ZG_PRIVATE_KEY=your_private_key_here
```

### Workflow
1. **Create Account & Add Funds**
  ```bash
  0g-compute-cli add-account --amount 0.1
  ```
2. **List Providers & Models**
  ```bash
  0g-compute-cli list-providers
  0g-compute-cli list-models
  ```
3. **Prepare Config & Data**
  - Download parameter file template and dataset format spec
4. **Upload Dataset**
  ```bash
  0g-compute-cli upload --data-path <PATH_TO_DATASET>
  ```
5. **Calculate Dataset Size**
  ```bash
  0g-compute-cli calculate-token --model <MODEL_NAME> --dataset-path <PATH_TO_DATASET> --provider <PROVIDER_ADDRESS>
  ```
6. **Create Task**
  ```bash
  0g-compute-cli create-task --provider <PROVIDER_ADDRESS> --model <MODEL_NAME> --dataset <DATASET_ROOT_HASH> --config-path <PATH_TO_CONFIG_FILE> --data-size <DATASET_SIZE>
  ```
7. **Monitor Progress**
  ```bash
  0g-compute-cli get-task --provider <PROVIDER_ADDRESS> --task <TASK_ID>
  ```
8. **Download & Decrypt Model**
  - Use `acknowledge-model` and `decrypt-model` commands as described in the CLI output

---

## Storage SDK

### Go SDK
- **Install:**
  ```bash
  go get github.com/0gfoundation/0g-storage-client
  ```
- **Features:**
  - Upload/download files
  - Manage data
  - Leverage decentralization

#### Example: Uploading a File (Go)
```go
import (
    "context"
    "github.com/0gfoundation/0g-storage-client/common/blockchain"
    "github.com/0gfoundation/0g-storage-client/indexer"
    "github.com/0gfoundation/0g-storage-client/transfer"
    "github.com/0gfoundation/0g-storage-client/core"
)

w3client := blockchain.MustNewWeb3(evmRpc, privateKey)
defer w3client.Close()
indexerClient, err := indexer.NewClient(indRpc)
// ...
nodes, err := indexerClient.SelectNodes(ctx, segmentNumber, expectedReplicas, excludedNodes)
uploader, err := transfer.NewUploader(ctx, w3client, nodes)
txHash, err := uploader.UploadFile(ctx, filePath)
```

#### Example: Downloading a File (Go)
```go
downloader, err := transfer.NewDownloader(nodes)
err = downloader.Download(ctx, rootHash, outputPath, withProof)
```

### TypeScript SDK
- **Starter Kit:** [TypeScript Starter Kit](https://github.com/0gfoundation/0g-storage-starter-kit)

---


## Community & Support

- [Discord](https://discord.gg/0gfoundation) — Developer and user support
- [Telegram](https://t.me/zeroG_labs) — Community chat
- [X (Twitter)](https://twitter.com/0g_labs) — Announcements
- [Blog](https://blog.0g.ai) — Updates and deep dives

---

## FAQ

**Q: How do I get testnet tokens?**  
A: Use the [0G Faucet](https://faucet.0g.ai) with your wallet address.

**Q: Can I use 0G with my existing dApp?**  
A: Yes, 0G is EVM-compatible and supports integration with most Ethereum-based tools.

**Q: How do I run a validator?**  
A: Follow the validator setup guide and use the staking contract to register your validator.

**Q: How do I fine-tune an AI model?**  
A: Use the Fine-tuning CLI to upload your dataset, create a task, and monitor progress.

**Q: Where can I get more help?**  
A: Join the [Discord](https://discord.gg/0gfoundation) or check the [official docs](https://docs.0g.ai/).

---

## References
- [Official Documentation](https://docs.0g.ai/)
- [GitHub](https://github.com/0gfoundation)
- [Block Explorer](https://chainscan-galileo.0g.ai)
- [Faucet](https://faucet.0g.ai)

---

© 0G Labs. All rights reserved.