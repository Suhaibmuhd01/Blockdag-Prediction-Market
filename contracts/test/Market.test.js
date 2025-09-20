const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("PredictionMarket", function () {
  async function deployFixture() {
    const [owner, user1, user2, user3] = await ethers.getSigners();
    
    // Deploy mock USDC
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const usdc = await MockERC20.deploy("Mock USDC", "USDC", 6, ethers.parseUnits("1000000", 6));
    
    // Deploy factory
    const MarketFactory = await ethers.getContractFactory("MarketFactory");
    const factory = await MarketFactory.deploy(usdc.target);
    
    // Give users some tokens
    await usdc.mint(user1.address, ethers.parseUnits("1000", 6));
    await usdc.mint(user2.address, ethers.parseUnits("1000", 6));
    await usdc.mint(user3.address, ethers.parseUnits("1000", 6));
    
    return { factory, usdc, owner, user1, user2, user3 };
  }
  
  describe("MarketFactory", function () {
    it("Should deploy with correct staking token", async function () {
      const { factory, usdc } = await loadFixture(deployFixture);
      expect(await factory.stakingToken()).to.equal(usdc.target);
    });
    
    it("Should create a new market", async function () {
      const { factory, user1 } = await loadFixture(deployFixture);
      
      const question = "Will ETH reach $5000 by end of year?";
      const duration = 24 * 60 * 60; // 24 hours
      
      await expect(factory.connect(user1).createMarket(question, duration))
        .to.emit(factory, "MarketCreated");
      
      const market = await factory.getMarket(0);
      expect(market.question).to.equal(question);
      expect(market.creator).to.equal(user1.address);
      expect(market.resolved).to.be.false;
    });
    
    it("Should reject invalid market creation", async function () {
      const { factory, user1 } = await loadFixture(deployFixture);
      
      // Empty question
      await expect(factory.connect(user1).createMarket("", 3600))
        .to.be.revertedWith("Empty question");
      
      // Duration too short
      await expect(factory.connect(user1).createMarket("Test?", 1800))
        .to.be.revertedWith("Invalid duration");
      
      // Duration too long 
      await expect(factory.connect(user1).createMarket("Test?", 366 * 24 * 60 * 60))
        .to.be.revertedWith("Invalid duration");
    });
  });
  
  describe("Market Operations", function () {
    async function deployMarketFixture() {
      const base = await loadFixture(deployFixture);
      
      const question = "Will it rain tomorrow?";
      const duration = 24 * 60 * 60; // 24 hours
      
      await base.factory.connect(base.user1).createMarket(question, duration);
      const marketInfo = await base.factory.getMarket(0);
      
      const Market = await ethers.getContractFactory("Market");
      const market = Market.attach(marketInfo.marketAddress);
      
      return { ...base, market, marketInfo };
    }
    
    it("Should allow users to stake on Yes", async function () {
      const { market, usdc, user1 } = await loadFixture(deployMarketFixture);
      
      const stakeAmount = ethers.parseUnits("100", 6);
      
      // Approve and stake
      await usdc.connect(user1).approve(market.target, stakeAmount);
      await expect(market.connect(user1).stake(true, stakeAmount))
        .to.emit(market, "Staked")
        .withArgs(user1.address, true, stakeAmount, stakeAmount, 0);
      
      const [yesStake, noStake] = await market.getPosition(user1.address);
      expect(yesStake).to.equal(stakeAmount);
      expect(noStake).to.equal(0);
    });
    
    it("Should allow users to stake on No", async function () {
      const { market, usdc, user2 } = await loadFixture(deployMarketFixture);
      
      const stakeAmount = ethers.parseUnits("50", 6);
      
      await usdc.connect(user2).approve(market.target, stakeAmount);
      await expect(market.connect(user2).stake(false, stakeAmount))
        .to.emit(market, "Staked")
        .withArgs(user2.address, false, stakeAmount, 0, stakeAmount);
      
      const [yesStake, noStake] = await market.getPosition(user2.address);
      expect(yesStake).to.equal(0);
      expect(noStake).to.equal(stakeAmount);
    });
    
    it("Should calculate correct odds", async function () {
      const { market, usdc, user1, user2 } = await loadFixture(deployMarketFixture);
      
      // Initially 50%
      expect(await market.getOdds()).to.equal(50);
      
      // Stake 100 on Yes
      await usdc.connect(user1).approve(market.target, ethers.parseUnits("100", 6));
      await market.connect(user1).stake(true, ethers.parseUnits("100", 6));
      expect(await market.getOdds()).to.equal(100); // 100% Yes
      
      // Stake 100 on No
      await usdc.connect(user2).approve(market.target, ethers.parseUnits("100", 6));
      await market.connect(user2).stake(false, ethers.parseUnits("100", 6));
      expect(await market.getOdds()).to.equal(50); // Back to 50%
    });
    
    it("Should not allow staking after market ends", async function () {
      const { market, usdc, user1, marketInfo } = await loadFixture(deployMarketFixture);
      
      // Move time past end time
      await time.increaseTo(marketInfo.endTime + 1n);
      
      await usdc.connect(user1).approve(market.target, ethers.parseUnits("100", 6));
      await expect(market.connect(user1).stake(true, ethers.parseUnits("100", 6)))
        .to.be.revertedWith("Market ended");
    });
  });
  
  describe("Market Resolution & Withdrawal", function () {
    async function deployStakedMarketFixture() {
      const base = await loadFixture(deployFixture);
      
      const question = "Will it rain tomorrow?";
      const duration = 24 * 60 * 60;
      
      await base.factory.connect(base.user1).createMarket(question, duration);
      const marketInfo = await base.factory.getMarket(0);
      
      const Market = await ethers.getContractFactory("Market");
      const market = Market.attach(marketInfo.marketAddress);
      
      // User1 stakes 100 on Yes
      await base.usdc.connect(base.user1).approve(market.target, ethers.parseUnits("100", 6));
      await market.connect(base.user1).stake(true, ethers.parseUnits("100", 6));
      
      // User2 stakes 200 on No  
      await base.usdc.connect(base.user2).approve(market.target, ethers.parseUnits("200", 6));
      await market.connect(base.user2).stake(false, ethers.parseUnits("200", 6));
      
      // User3 stakes 100 on Yes
      await base.usdc.connect(base.user3).approve(market.target, ethers.parseUnits("100", 6));
      await market.connect(base.user3).stake(true, ethers.parseUnits("100", 6));
      
      return { ...base, market, marketInfo };
    }
    
    it("Should resolve market correctly", async function () {
      const { factory, market, marketInfo, user1 } = await loadFixture(deployStakedMarketFixture);
      
      // Move past end time
      await time.increaseTo(marketInfo.endTime + 1n);
      
      // Only creator can resolve
      await expect(factory.connect(user1).resolveMarket(0, true))
        .to.emit(market, "Resolved");
      
      expect(await market.resolved()).to.be.true;
    });
    
    it("Should calculate winnings correctly for Yes outcome", async function () {
      const { factory, market, marketInfo, user1, user2, user3 } = await loadFixture(deployStakedMarketFixture);
      
      await time.increaseTo(marketInfo.endTime + 1n);
      await factory.connect(user1).resolveMarket(0, true); // Yes wins
      
      // User1: staked 100 on Yes, should get 100 + (100/200 * 200) = 200
      expect(await market.calculateWinnings(user1.address)).to.equal(ethers.parseUnits("200", 6));
      
      // User2: staked 200 on No, should get 0
      expect(await market.calculateWinnings(user2.address)).to.equal(0);
      
      // User3: staked 100 on Yes, should get 100 + (100/200 * 200) = 200  
      expect(await market.calculateWinnings(user3.address)).to.equal(ethers.parseUnits("200", 6));
    });
    
    it("Should allow winners to withdraw", async function () {
      const { factory, market, marketInfo, usdc, user1, user2, user3 } = await loadFixture(deployStakedMarketFixture);
      
      const initialBalance = await usdc.balanceOf(user1.address);
      
      await time.increaseTo(marketInfo.endTime + 1n);
      await factory.connect(user1).resolveMarket(0, true);
      
      // User1 withdraws winnings
      await expect(market.connect(user1).withdraw())
        .to.emit(market, "Withdrawn")
        .withArgs(user1.address, ethers.parseUnits("200", 6));
      
      const finalBalance = await usdc.balanceOf(user1.address);
      expect(finalBalance - initialBalance).to.equal(ethers.parseUnits("100", 6)); // Net gain of 100
    });
    
    it("Should not allow withdrawal before resolution", async function () {
      const { market, user1 } = await loadFixture(deployStakedMarketFixture);
      
      await expect(market.connect(user1).withdraw())
        .to.be.revertedWith("Market not resolved");
    });
  });
});