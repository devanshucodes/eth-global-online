const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying AVAXDividendDistributor to Fuji Testnet...");

  // Get the contract factory
  const AVAXDividendDistributor = await ethers.getContractFactory("AVAXDividendDistributor");

  // Deploy the contract
  console.log("Deploying contract...");
  const dividendDistributor = await AVAXDividendDistributor.deploy(
    "Zero-Man Company Token", // Token name
    "ZMC" // Token symbol
  );

  console.log("Waiting for deployment...");
  await dividendDistributor.waitForDeployment();

  const contractAddress = await dividendDistributor.getAddress();
  const owner = await dividendDistributor.owner();

  console.log("✅ Contract deployed successfully!");
  console.log("Contract Address:", contractAddress);
  console.log("Owner:", owner);
  console.log("Network: Fuji Testnet (43113)");
  console.log("\n📋 Next steps:");
  console.log("1. Verify contract on Snowtrace:");
  console.log(`   npx hardhat verify --network fuji ${contractAddress} "Zero-Man Company Token" "ZMC"`);
  console.log("2. Get test AVAX from Fuji faucet: https://faucet.avax.network/");
  console.log("3. Send AVAX to contract address to trigger dividend distribution");
  console.log("4. Token holders can call withdrawDividend() to claim their rewards");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

