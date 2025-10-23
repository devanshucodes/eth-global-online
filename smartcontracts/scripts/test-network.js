const { ethers } = require("hardhat");

async function main() {
  console.log("Testing Fuji network connection...");
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);
    console.log("Deployer balance:", ethers.utils.formatEther(await deployer.getBalance()));
    
    // Test network connection
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name, "Chain ID:", network.chainId);
    
    // Test gas price
    const gasPrice = await ethers.provider.getGasPrice();
    console.log("Gas price:", ethers.utils.formatUnits(gasPrice, "gwei"), "gwei");
    
  } catch (error) {
    console.error("Network test failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });

