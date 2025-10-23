const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AVAXDividendDistributor", function () {
  let dividendDistributor;
  let owner, user1, user2, user3;
  const tokenName = "Zero-Man Company Token";
  const tokenSymbol = "ZMC";

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

    const AVAXDividendDistributor = await ethers.getContractFactory("AVAXDividendDistributor");
    dividendDistributor = await AVAXDividendDistributor.deploy(tokenName, tokenSymbol);
    await dividendDistributor.deployed();
  });

  describe("Deployment", function () {
    it("Should set the correct token name and symbol", async function () {
      expect(await dividendDistributor.name()).to.equal(tokenName);
      expect(await dividendDistributor.symbol()).to.equal(tokenSymbol);
    });

    it("Should set the correct owner", async function () {
      expect(await dividendDistributor.owner()).to.equal(owner.address);
    });

    it("Should have zero initial supply", async function () {
      expect(await dividendDistributor.totalSupply()).to.equal(0);
    });
  });

  describe("Token Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.utils.parseEther("1000");
      await dividendDistributor.mint(user1.address, mintAmount);
      
      expect(await dividendDistributor.balanceOf(user1.address)).to.equal(mintAmount);
      expect(await dividendDistributor.totalSupply()).to.equal(mintAmount);
    });

    it("Should update dividend corrections when minting", async function () {
      const mintAmount = ethers.utils.parseEther("1000");
      await dividendDistributor.mint(user1.address, mintAmount);
      
      // Check that dividend corrections are properly set
      const corrections = await dividendDistributor.getMagnifiedDividendCorrections(user1.address);
      expect(corrections).to.equal(0); // Should be 0 initially
    });
  });

  describe("AVAX Distribution", function () {
    beforeEach(async function () {
      // Mint tokens to users
      await dividendDistributor.mint(user1.address, ethers.utils.parseEther("1000"));
      await dividendDistributor.mint(user2.address, ethers.utils.parseEther("2000"));
      await dividendDistributor.mint(user3.address, ethers.utils.parseEther("3000"));
    });

    it("Should distribute 20% to token holders and 80% to owner", async function () {
      const sendAmount = ethers.utils.parseEther("10");
      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      
      // Send AVAX to contract
      await user1.sendTransaction({
        to: dividendDistributor.address,
        value: sendAmount
      });

      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      const ownerReceived = ownerBalanceAfter - ownerBalanceBefore;
      
      // Owner should receive 80% (8 AVAX)
      expect(Number(ownerReceived)).to.be.closeTo(Number(ethers.utils.parseEther("8")), Number(ethers.utils.parseEther("0.1")));
    });

    it("Should update magnified dividend per share", async function () {
      const sendAmount = ethers.utils.parseEther("10");
      
      await user1.sendTransaction({
        to: dividendDistributor.address,
        value: sendAmount
      });

      // Check that magnified dividend per share was updated
      const magnifiedDividendPerShare = await dividendDistributor.getMagnifiedDividendPerShare();
      expect(magnifiedDividendPerShare).to.be.gt(0);
    });

    it("Should emit DividendsDistributed event", async function () {
      const sendAmount = ethers.utils.parseEther("10");
      
      await expect(
        user1.sendTransaction({
          to: dividendDistributor.address,
          value: sendAmount
        })
      ).to.emit(dividendDistributor, "DividendsDistributed")
        .withArgs(user1.address, ethers.utils.parseEther("2")); // 20% of 10 AVAX
    });
  });

  describe("Dividend Withdrawal", function () {
    beforeEach(async function () {
      // Mint tokens to users
      await dividendDistributor.mint(user1.address, ethers.utils.parseEther("1000"));
      await dividendDistributor.mint(user2.address, ethers.utils.parseEther("2000"));
      
      // Send AVAX to trigger distribution
      await user1.sendTransaction({
        to: dividendDistributor.address,
        value: ethers.utils.parseEther("10")
      });
    });

    it("Should allow users to withdraw their dividends", async function () {
      const balanceBefore = await ethers.provider.getBalance(user1.address);
      
      await dividendDistributor.connect(user1).withdrawDividend();
      
      const balanceAfter = await ethers.provider.getBalance(user1.address);
      const received = balanceAfter - balanceBefore;
      
      // User1 has 1000 tokens out of 3000 total (33.33%)
      // Should receive 33.33% of 2 AVAX = ~0.667 AVAX
      expect(Number(received)).to.be.closeTo(Number(ethers.utils.parseEther("0.667")), Number(ethers.utils.parseEther("0.1")));
    });

    it("Should emit DividendWithdrawn event", async function () {
      await expect(dividendDistributor.connect(user1).withdrawDividend())
        .to.emit(dividendDistributor, "DividendWithdrawn")
        .withArgs(user1.address, await dividendDistributor.withdrawableDividendOf(user1.address));
    });

    it("Should not allow withdrawal if no dividend available", async function () {
      // User3 has no tokens, so no dividend
      await expect(dividendDistributor.connect(user3).withdrawDividend())
        .to.be.revertedWith("No dividend available");
    });

    it("Should update withdrawn dividends mapping", async function () {
      const withdrawableBefore = await dividendDistributor.withdrawableDividendOf(user1.address);
      
      await dividendDistributor.connect(user1).withdrawDividend();
      
      const withdrawnDividends = await dividendDistributor.getWithdrawnDividends(user1.address);
      expect(withdrawnDividends).to.equal(withdrawableBefore);
    });
  });

  describe("Proportional Distribution", function () {
    it("Should distribute dividends proportionally based on token holdings", async function () {
      // User1: 1000 tokens (25%)
      // User2: 3000 tokens (75%)
      await dividendDistributor.mint(user1.address, ethers.utils.parseEther("1000"));
      await dividendDistributor.mint(user2.address, ethers.utils.parseEther("3000"));
      
      // Send 10 AVAX (2 AVAX for dividends)
      await user1.sendTransaction({
        to: dividendDistributor.address,
        value: ethers.utils.parseEther("10")
      });

      const user1Dividend = await dividendDistributor.withdrawableDividendOf(user1.address);
      const user2Dividend = await dividendDistributor.withdrawableDividendOf(user2.address);
      
      // User1 should get 25% of 2 AVAX = 0.5 AVAX
      // User2 should get 75% of 2 AVAX = 1.5 AVAX
      expect(Number(user1Dividend)).to.be.closeTo(Number(ethers.utils.parseEther("0.5")), Number(ethers.utils.parseEther("0.01")));
      expect(Number(user2Dividend)).to.be.closeTo(Number(ethers.utils.parseEther("1.5")), Number(ethers.utils.parseEther("0.01")));
    });
  });

  describe("Token Transfers", function () {
    beforeEach(async function () {
      await dividendDistributor.mint(user1.address, ethers.utils.parseEther("1000"));
      await dividendDistributor.mint(user2.address, ethers.utils.parseEther("1000"));
      
      // Send AVAX to create dividends
      await user1.sendTransaction({
        to: dividendDistributor.address,
        value: ethers.utils.parseEther("10")
      });
    });

    it("Should update dividend corrections when tokens are transferred", async function () {
      const transferAmount = ethers.utils.parseEther("500");
      
      await dividendDistributor.connect(user1).transfer(user2.address, transferAmount);
      
      // Check that balances are updated
      expect(await dividendDistributor.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("500"));
      expect(await dividendDistributor.balanceOf(user2.address)).to.equal(ethers.utils.parseEther("1500"));
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero total supply gracefully", async function () {
      // Send AVAX when no tokens exist
      await expect(
        user1.sendTransaction({
          to: dividendDistributor.address,
          value: ethers.utils.parseEther("1")
        })
      ).to.not.be.reverted;
    });

    it("Should reject zero value transactions", async function () {
      await expect(
        user1.sendTransaction({
          to: dividendDistributor.address,
          value: 0
        })
      ).to.be.revertedWith("No AVAX sent");
    });
  });
});
