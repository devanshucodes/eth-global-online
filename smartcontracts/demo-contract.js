const { ethers } = require("hardhat");

async function demonstrateContract() {
  console.log("🚀 AVAX Dividend Distributor Contract Demo");
  console.log("=" .repeat(50));
  
  // Contract details
  const contractAddress = "0x0471AaD869eBa890d63A2f276828879A9a375858";
  const fujiRpcUrl = "https://api.avax-test.network/ext/bc/C/rpc";
  
  // Connect to Fuji testnet
  const provider = new ethers.providers.JsonRpcProvider(fujiRpcUrl);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  // Contract ABI (simplified for demo)
  const contractABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function owner() view returns (address)",
    "function balanceOf(address) view returns (uint256)",
    "function mint(address to, uint256 amount) external",
    "function withdrawableDividendOf(address) view returns (uint256)",
    "function withdrawDividend() external",
    "function getMagnifiedDividendPerShare() view returns (uint256)"
  ];
  
  const contract = new ethers.Contract(contractAddress, contractABI, wallet);
  
  try {
    // 1. Show contract basic info
    console.log("\n📋 Contract Information:");
    console.log("Contract Address:", contractAddress);
    console.log("Network: Fuji Testnet (43113)");
    console.log("Explorer: https://testnet.snowtrace.io/address/" + contractAddress);
    
    const name = await contract.name();
    const symbol = await contract.symbol();
    const totalSupply = await contract.totalSupply();
    const owner = await contract.owner();
    
    console.log("\n📊 Contract Details:");
    console.log("Name:", name);
    console.log("Symbol:", symbol);
    console.log("Total Supply:", ethers.utils.formatEther(totalSupply), "tokens");
    console.log("Owner:", owner);
    console.log("Your Address:", wallet.address);
    
    // 2. Check current balances
    console.log("\n💰 Current Balances:");
    const yourBalance = await contract.balanceOf(wallet.address);
    console.log("Your Token Balance:", ethers.utils.formatEther(yourBalance), "ZMC");
    
    const contractBalance = await provider.getBalance(contractAddress);
    console.log("Contract AVAX Balance:", ethers.utils.formatEther(contractBalance), "AVAX");
    
    const yourAvaxBalance = await provider.getBalance(wallet.address);
    console.log("Your AVAX Balance:", ethers.utils.formatEther(yourAvaxBalance), "AVAX");
    
    // 3. Show dividend info
    console.log("\n💎 Dividend Information:");
    const magnifiedDividendPerShare = await contract.getMagnifiedDividendPerShare();
    console.log("Magnified Dividend Per Share:", magnifiedDividendPerShare.toString());
    
    const withdrawableDividend = await contract.withdrawableDividendOf(wallet.address);
    console.log("Your Withdrawable Dividend:", ethers.utils.formatEther(withdrawableDividend), "AVAX");
    
    // 4. Show how to mint tokens (as owner)
    console.log("\n🪙 How to Mint Tokens (Owner Only):");
    console.log("// Mint 1000 tokens to an address");
    console.log("await contract.mint('0x...', ethers.utils.parseEther('1000'));");
    
    // 5. Show how to send AVAX to contract
    console.log("\n💸 How to Send AVAX to Contract:");
    console.log("// Send 1 AVAX to contract (triggers 20% distribution)");
    console.log("await wallet.sendTransaction({");
    console.log("  to: contractAddress,");
    console.log("  value: ethers.utils.parseEther('1')");
    console.log("});");
    
    // 6. Show how to claim dividends
    console.log("\n🎁 How to Claim Dividends:");
    console.log("// Check withdrawable dividend");
    console.log("const withdrawable = await contract.withdrawableDividendOf(wallet.address);");
    console.log("// Withdraw dividend");
    console.log("await contract.withdrawDividend();");
    
    console.log("\n✅ Demo completed! Your contract is ready to use.");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Run the demo
demonstrateContract().catch(console.error);
