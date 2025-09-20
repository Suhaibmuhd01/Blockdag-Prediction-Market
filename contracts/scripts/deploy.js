const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));
  
  // Deploy MockERC20 (testnet USDC)
  console.log("\nDeploying MockERC20 (testnet USDC)...");
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const usdc = await MockERC20.deploy("Mock USDC", "USDC", 6, ethers.parseUnits("1000000", 6));
  await usdc.waitForDeployment();
  console.log("MockERC20 deployed to:", usdc.target);
  
  // Deploy MarketFactory
  console.log("\nDeploying MarketFactory...");
  const MarketFactory = await ethers.getContractFactory("MarketFactory");
  const factory = await MarketFactory.deploy(usdc.target);
  await factory.waitForDeployment();
  console.log("MarketFactory deployed to:", factory.target);
  
  // Create some test markets for demo
  console.log("\nCreating test markets...");
  
  const questions = [
    "Will Bitcoin reach $100,000 by end of 2024?",
    "Will Ethereum 2.0 launch successfully this year?", 
    "Will AI achieve AGI by 2025?"
  ];
  
  const durations = [
    30 * 24 * 60 * 60, // 30 days
    60 * 24 * 60 * 60, // 60 days  
    90 * 24 * 60 * 60  // 90 days
  ];
  
  for (let i = 0; i < questions.length; i++) {
    const tx = await factory.createMarket(questions[i], durations[i]);
    await tx.wait();
    console.log(`Created market ${i}: "${questions[i]}"`);
  }
  
  // Fund some test accounts with USDC
  console.log("\nFunding test accounts...");
  const testAccounts = [
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Hardhat account 0
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Hardhat account 1
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Hardhat account 2
  ];
  
  for (const account of testAccounts) {
    try {
      const tx = await usdc.mint(account, ethers.parseUnits("10000", 6));
      await tx.wait();
      console.log(`Funded ${account} with 10,000 USDC`);
    } catch (error) {
      console.log(`Skipped funding ${account} (may not exist)`);
    }
  }
  
  console.log("\n" + "=".repeat(50));
  console.log("DEPLOYMENT COMPLETE");
  console.log("=".repeat(50));
  console.log("MockERC20 (USDC):", usdc.target);
  console.log("MarketFactory:", factory.target);
  console.log("\nSave these addresses to your frontend config!");
  
  // Write addresses to a file for frontend
  const fs = require('fs');
  const addresses = {
    USDC: usdc.target,
    MarketFactory: factory.target,
    chainId: (await ethers.provider.getNetwork()).chainId.toString()
  };
  
  fs.writeFileSync('../src/contracts/addresses.json', JSON.stringify(addresses, null, 2));
  console.log("\nAddresses saved to src/contracts/addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });