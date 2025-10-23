# Avalanche Zero-Man Company Smart Contract

A smart contract that automatically distributes 20% of incoming AVAX to token holders proportionally, while keeping 80% for the contract owner.

## 🚀 Features

- **ERC20 Token with Dividends**: Each token represents a share in the dividend pool
- **Automatic Distribution**: 20% of incoming AVAX goes to token holders, 80% to owner
- **Pull-Based Rewards**: Token holders claim dividends via `withdrawDividend()` (gas-efficient)
- **Accurate Tracking**: Uses magnified dividend per share technique to avoid rounding errors
- **Fuji Testnet Ready**: Deployable on Avalanche Fuji (chain ID 43113)

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Avalanche Fuji testnet AVAX (get from [faucet](https://faucet.avax.network/))
- Private key for deployment

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and add your private key and Snowtrace API key:
   ```
   PRIVATE_KEY=your_private_key_here
   SNOWTRACE_API_KEY=your_snowtrace_api_key_here
   ```

## 🧪 Testing

Run the comprehensive test suite:

```bash
npm test
```

The tests cover:
- Contract deployment
- Token minting and transfers
- AVAX distribution (20% to holders, 80% to owner)
- Dividend withdrawal
- Proportional distribution based on token holdings
- Edge cases and error handling

## 🚀 Deployment

### Deploy to Fuji Testnet

```bash
npm run deploy:fuji
```

This will:
- Deploy the contract to Fuji testnet
- Display the contract address
- Provide verification command

### Verify Contract

After deployment, verify the contract on Snowtrace:

```bash
npm run verify:fuji
```

## 📖 Usage

### 1. Deploy and Mint Tokens

```javascript
// Deploy contract
const dividendDistributor = await AVAXDividendDistributor.deploy("Token Name", "SYMBOL");

// Mint tokens to users
await dividendDistributor.mint(userAddress, ethers.parseEther("1000"));
```

### 2. Send AVAX to Contract

When someone sends AVAX to the contract:
- 20% is distributed proportionally to token holders
- 80% goes to the contract owner
- Distribution happens automatically

```javascript
// Send AVAX to contract (triggers distribution)
await user.sendTransaction({
  to: contractAddress,
  value: ethers.parseEther("10") // 10 AVAX
});
```

### 3. Claim Dividends

Token holders can claim their dividends:

```javascript
// Check withdrawable dividend
const withdrawable = await dividendDistributor.withdrawableDividendOf(userAddress);

// Withdraw dividend
await dividendDistributor.withdrawDividend();
```

## 🔧 Smart Contract Functions

### Core Functions

- `receive()`: Handles incoming AVAX and distributes dividends
- `withdrawDividend()`: Allows token holders to claim their dividends
- `withdrawableDividendOf(address)`: Returns claimable dividend for an address
- `accumulativeDividendOf(address)`: Returns total accumulated dividend for an address

### Owner Functions

- `mint(address, amount)`: Mint new tokens (owner only)
- `burn(address, amount)`: Burn tokens (owner only)

## 📊 How It Works

1. **Token Creation**: Owner mints tokens to users
2. **AVAX Reception**: When contract receives AVAX:
   - Calculates 20% for dividend distribution
   - Updates `magnifiedDividendPerShare`
   - Sends 80% to owner
3. **Dividend Tracking**: Uses magnified dividend technique for accurate proportional tracking
4. **Token Transfers**: Automatically updates dividend corrections when tokens are transferred
5. **Withdrawal**: Users call `withdrawDividend()` to claim their share

## 🌐 Network Configuration

### Fuji Testnet
- **Chain ID**: 43113
- **RPC URL**: https://api.avax-test.network/ext/bc/C/rpc
- **Explorer**: https://testnet.snowtrace.io/

### Mainnet
- **Chain ID**: 43114
- **RPC URL**: https://api.avax.network/ext/bc/C/rpc
- **Explorer**: https://snowtrace.io/

## 🔒 Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Ownable**: Only owner can mint/burn tokens
- **Accurate Math**: Uses fixed-point arithmetic to prevent rounding errors
- **Pull-Based**: Users pull dividends instead of automatic distribution (saves gas)

## 📝 Events

- `DividendsDistributed(address indexed from, uint256 weiAmount)`: Emitted when dividends are distributed
- `DividendWithdrawn(address indexed to, uint256 weiAmount)`: Emitted when user withdraws dividend

## 🐛 Troubleshooting

### Common Issues

1. **"No AVAX sent"**: Ensure you're sending a positive amount
2. **"No dividend available"**: User has no tokens or no dividends to claim
3. **"Owner transfer failed"**: Check owner address and gas limits
4. **"AVAX transfer failed"**: Check recipient address and gas limits

### Gas Optimization

- The contract uses pull-based dividends to avoid gas-intensive loops
- Token transfers automatically update dividend corrections
- Magnified dividend technique ensures accurate calculations

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For questions or issues:
- Create an issue in the repository
- Check the test files for usage examples
- Review the smart contract code for implementation details

