const { ethers } = require("hardhat");

async function main() {
  const addresses = require('../../src/contracts/addresses.json');
  
  const [owner, user1, user2] = await ethers.getSigners();
  
  console.log("Running demo script...");
  console.log("Owner:", owner.address);
  console.log("User1:", user1.address);  
  console.log("User2:", user2.address);
  
  // Get contract instances
  const MockERC20 = await ethers.getContractFactory("MockERC20");
  const usdc = MockERC20.attach(addresses.USDC);
  
  const MarketFactory = await ethers.getContractFactory("MarketFactory");
  const factory = MarketFactory.attach(addresses.MarketFactory);
  
  // Get first market
  const marketInfo = await factory.getMarket(0);
  const Market = await ethers.getContractFactory("Market");
  const market = Market.attach(marketInfo.marketAddress);
  
  console.log("\n📊 Market:", marketInfo.question);
  console.log("End time:", new Date(Number(marketInfo.endTime) * 1000).toLocaleString());
  
  // User1 stakes on Yes
  console.log("\n💰 User1 stakes 1000 USDC on YES...");
  await usdc.connect(user1).approve(market.target, ethers.parseUnits("1000", 6));
  await market.connect(user1).stake(true, ethers.parseUnits("1000", 6));
  
  // User2 stakes on No  
  console.log("💰 User2 stakes 500 USDC on NO...");
  await usdc.connect(user2).approve(market.target, ethers.parseUnits("500", 6));
  await market.connect(user2).stake(false, ethers.parseUnits("500", 6));
  
  // Show current state
  const odds = await market.getOdds();
  const totalYes = await market.totalYesStake();
  const totalNo = await market.totalNoStake();
  
  console.log("\n📈 Current Market State:");
  console.log("YES stakes:", ethers.formatUnits(totalYes, 6), "USDC");
  console.log("NO stakes:", ethers.formatUnits(totalNo, 6), "USDC");
  console.log("YES odds:", odds + "%");
  
  console.log("\n✅ Demo completed! Market is ready for frontend testing.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });