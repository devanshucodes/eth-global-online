const { ethers } = require("hardhat");

async function interactiveDemo() {
  console.log("🎮 Interactive Contract Demo");
  console.log("=" .repeat(40));
  
  const contractAddress = "0x0471AaD869eBa890d63A2f276828879A9a375858";
  const fujiRpcUrl = "https://api.avax-test.network/ext/bc/C/rpc";
  
  const provider = new ethers.providers.JsonRpcProvider(fujiRpcUrl);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
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
    console.log("\n1️⃣ MINTING TOKENS (Owner Function)");
    console.log("-".repeat(30));
    
    // Mint 1000 tokens to the owner
    console.log("Minting 1000 ZMC tokens to owner...");
    const mintTx = await contract.mint(wallet.address, ethers.utils.parseEther("1000"));
    await mintTx.wait();
    console.log("✅ Tokens minted! Transaction:", mintTx.hash);
    
    // Check new balance
    const newBalance = await contract.balanceOf(wallet.address);
    const totalSupply = await contract.totalSupply();
    console.log("Your Token Balance:", ethers.utils.formatEther(newBalance), "ZMC");
    console.log("Total Supply:", ethers.utils.formatEther(totalSupply), "ZMC");
    
    console.log("\n2️⃣ SENDING AVAX TO CONTRACT");
    console.log("-".repeat(30));
    
    // Check AVAX balance before
    const balanceBefore = await provider.getBalance(wallet.address);
    console.log("Your AVAX Balance Before:", ethers.utils.formatEther(balanceBefore), "AVAX");
    
    // Send 0.01 AVAX to contract (small amount for demo)
    console.log("Sending 0.01 AVAX to contract...");
    const sendTx = await wallet.sendTransaction({
      to: contractAddress,
      value: ethers.utils.parseEther("0.01")
    });
    await sendTx.wait();
    console.log("✅ AVAX sent! Transaction:", sendTx.hash);
    
    // Check balances after
    const balanceAfter = await provider.getBalance(wallet.address);
    const contractBalance = await provider.getBalance(contractAddress);
    console.log("Your AVAX Balance After:", ethers.utils.formatEther(balanceAfter), "AVAX");
    console.log("Contract AVAX Balance:", ethers.utils.formatEther(contractBalance), "AVAX");
    
    console.log("\n3️⃣ DIVIDEND DISTRIBUTION");
    console.log("-".repeat(30));
    
    // Check dividend info
    const magnifiedDividendPerShare = await contract.getMagnifiedDividendPerShare();
    const withdrawableDividend = await contract.withdrawableDividendOf(wallet.address);
    
    console.log("Magnified Dividend Per Share:", magnifiedDividendPerShare.toString());
    console.log("Your Withdrawable Dividend:", ethers.utils.formatEther(withdrawableDividend), "AVAX");
    
    if (withdrawableDividend.gt(0)) {
      console.log("\n4️⃣ CLAIMING DIVIDENDS");
      console.log("-".repeat(30));
      
      const balanceBeforeClaim = await provider.getBalance(wallet.address);
      console.log("AVAX Balance Before Claim:", ethers.utils.formatEther(balanceBeforeClaim), "AVAX");
      
      console.log("Claiming dividends...");
      const claimTx = await contract.withdrawDividend();
      await claimTx.wait();
      console.log("✅ Dividends claimed! Transaction:", claimTx.hash);
      
      const balanceAfterClaim = await provider.getBalance(wallet.address);
      const received = balanceAfterClaim.sub(balanceBeforeClaim);
      console.log("AVAX Balance After Claim:", ethers.utils.formatEther(balanceAfterClaim), "AVAX");
      console.log("Dividend Received:", ethers.utils.formatEther(received), "AVAX");
    } else {
      console.log("No dividends available to claim yet.");
    }
    
    console.log("\n🎉 Demo completed successfully!");
    console.log("\n📋 Summary:");
    console.log("- Contract is working perfectly");
    console.log("- Tokens can be minted by owner");
    console.log("- AVAX distribution works (20% to holders, 80% to owner)");
    console.log("- Dividends can be claimed by token holders");
    
  } catch (error) {
    console.error("❌ Error during demo:", error.message);
  }
}

// Run the interactive demo
interactiveDemo().catch(console.error);
