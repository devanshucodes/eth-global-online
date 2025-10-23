const { ethers } = require('ethers');
require('dotenv').config();

class Web3Service {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contract = null;
    this.contractAddress = process.env.CONTRACT_ADDRESS || "0x0471AaD869eBa890d63A2f276828879A9a375858";
    this.contractABI = [
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function totalSupply() view returns (uint256)",
      "function owner() view returns (address)",
      "function balanceOf(address) view returns (uint256)",
      "function mint(address to, uint256 amount) external",
      "function withdrawableDividendOf(address) view returns (uint256)",
      "function withdrawDividend() external",
      "function getMagnifiedDividendPerShare() view returns (uint256)",
      "event DividendsDistributed(address indexed from, uint256 weiAmount)",
      "event DividendWithdrawn(address indexed to, uint256 weiAmount)"
    ];
    
    this.initialize();
  }

  async initialize() {
    try {
      // Use Fuji testnet by default
      const rpcUrl = process.env.AVALANCHE_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc";
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      
      if (process.env.PRIVATE_KEY) {
        this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
        this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.wallet);
        console.log("✅ Web3 Service initialized successfully");
        console.log("📍 Contract Address:", this.contractAddress);
        console.log("👤 Wallet Address:", this.wallet.address);
      } else {
        console.warn("⚠️  PRIVATE_KEY not found. Web3 service initialized in read-only mode.");
        this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.provider);
      }
    } catch (error) {
      console.error("❌ Failed to initialize Web3 service:", error.message);
    }
  }

  /**
   * Distribute revenue to token holders
   * @param {number} revenueAmount - Revenue amount in AVAX
   * @param {string} projectId - Project ID for tracking
   */
  async distributeRevenue(revenueAmount, projectId = null) {
    try {
      if (!this.wallet) {
        throw new Error("Wallet not initialized. Need PRIVATE_KEY in environment.");
      }

      const revenueInWei = ethers.parseEther(revenueAmount.toString());
      
      console.log(`💰 Distributing ${revenueAmount} AVAX revenue for project ${projectId || 'N/A'}`);
      console.log(`📊 80% to owner, 20% to token holders`);

      // Send AVAX to contract (triggers automatic distribution)
      const tx = await this.wallet.sendTransaction({
        to: this.contractAddress,
        value: revenueInWei,
        gasLimit: 100000 // Set appropriate gas limit
      });

      console.log(`🚀 Revenue distribution transaction sent: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`✅ Revenue distributed successfully! Block: ${receipt.blockNumber}`);

      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        totalAmount: revenueAmount,
        ownerShare: revenueAmount * 0.8,
        dividendShare: revenueAmount * 0.2,
        projectId
      };

    } catch (error) {
      console.error("❌ Revenue distribution failed:", error.message);
      return {
        success: false,
        error: error.message,
        projectId
      };
    }
  }

  /**
   * Get contract information
   */
  async getContractInfo() {
    try {
      const [name, symbol, totalSupply, owner] = await Promise.all([
        this.contract.name(),
        this.contract.symbol(),
        this.contract.totalSupply(),
        this.contract.owner()
      ]);

      return {
        name,
        symbol,
        totalSupply: ethers.formatEther(totalSupply),
        owner,
        contractAddress: this.contractAddress
      };
    } catch (error) {
      console.error("❌ Failed to get contract info:", error.message);
      return null;
    }
  }

  /**
   * Get token holder dividend information
   * @param {string} address - Token holder address
   */
  async getDividendInfo(address) {
    try {
      const [balance, withdrawable, magnifiedDividendPerShare] = await Promise.all([
        this.contract.balanceOf(address),
        this.contract.withdrawableDividendOf(address),
        this.contract.getMagnifiedDividendPerShare()
      ]);

      return {
        tokenBalance: ethers.formatEther(balance),
        withdrawableDividend: ethers.formatEther(withdrawable),
        magnifiedDividendPerShare: magnifiedDividendPerShare.toString()
      };
    } catch (error) {
      console.error("❌ Failed to get dividend info:", error.message);
      return null;
    }
  }

  /**
   * Mint tokens to a token holder
   * @param {string} address - Recipient address
   * @param {number} amount - Amount of tokens to mint
   */
  async mintTokens(address, amount) {
    try {
      if (!this.wallet) {
        throw new Error("Wallet not initialized. Need PRIVATE_KEY in environment.");
      }

      const amountInWei = ethers.parseEther(amount.toString());
      const tx = await this.contract.mint(address, amountInWei);
      
      console.log(`🪙 Minting ${amount} tokens to ${address}. TX: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`✅ Tokens minted successfully! Block: ${receipt.blockNumber}`);

      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        recipient: address,
        amount
      };

    } catch (error) {
      console.error("❌ Token minting failed:", error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get contract balance
   */
  async getContractBalance() {
    try {
      const balance = await this.provider.getBalance(this.contractAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error("❌ Failed to get contract balance:", error.message);
      return "0";
    }
  }

  /**
   * Listen for contract events
   */
  setupEventListeners() {
    if (!this.contract) return;

    this.contract.on("DividendsDistributed", (from, weiAmount, event) => {
      const amount = ethers.formatEther(weiAmount);
      console.log(`🎉 Dividends distributed: ${amount} AVAX from ${from}`);
      console.log(`📋 Transaction: ${event.transactionHash}`);
    });

    this.contract.on("DividendWithdrawn", (to, weiAmount, event) => {
      const amount = ethers.formatEther(weiAmount);
      console.log(`💸 Dividend withdrawn: ${amount} AVAX to ${to}`);
      console.log(`📋 Transaction: ${event.transactionHash}`);
    });

    console.log("👂 Event listeners set up for smart contract");
  }
}

module.exports = new Web3Service();
