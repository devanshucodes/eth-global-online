# Avalanche Zero-Man Company Smart Contract (Fuji Testnet)

## Overview
This project implements a **Zero-Man Company** smart contract on the **Avalanche C-Chain (Fuji Testnet)**.  
The idea:
- There is a **main wallet** (the contract owner).
- Whenever the contract **receives AVAX**, it:
  - Distributes **20%** of the received amount **proportionally** to all token holders of a custom ERC20 token.
  - Keeps the remaining **80%** in the **owner wallet** (main wallet).
- Distribution happens **instantly** upon receiving funds.
- No cap on the number of token holders.

This contract uses the **magnified dividend per share** technique to ensure accurate, gas-efficient proportional payouts.

---

## Key Features
- **ERC20 Token with Dividends**  
  Each token represents a share in the dividend pool.  
- **Automatic Distribution**  
  Whenever the contract receives AVAX, **20% is allocated to token holders**, **80% goes to the owner**.
- **Claimable Rewards (Pull-Based)**  
  Token holders claim their dividends via `withdrawDividend()` instead of receiving them automatically (saves gas, avoids loops).
- **Accurate Tracking**  
  Uses fixed-point math (`magnitude = 2^128`) to avoid rounding errors.
- **Fuji Testnet Ready**  
  Deployable on Avalanche Fuji (chain ID `43113`).

---

## Smart Contract Code

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @title Avalanche AVAX Dividend Distributor
/// @notice Distributes 20% of incoming AVAX to token holders proportionally.
/// @dev 80% of the received funds go to the contract owner (main wallet).
contract AVAXDividendDistributor is ERC20, Ownable, ReentrancyGuard {
    uint256 private constant magnitude = 2**128;

    uint256 private magnifiedDividendPerShare;
    mapping(address => int256) private magnifiedDividendCorrections;
    mapping(address => uint256) private withdrawnDividends;

    event DividendsDistributed(address indexed from, uint256 weiAmount);
    event DividendWithdrawn(address indexed to, uint256 weiAmount);

    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) {
        // Optionally mint initial supply
        // _mint(msg.sender, 1000 * 10**decimals());
    }

    receive() external payable {
        require(msg.value > 0, "No AVAX sent");
        uint256 dividend = (msg.value * 20) / 100;
        uint256 ownerShare = msg.value - dividend;

        if (totalSupply() > 0 && dividend > 0) {
            magnifiedDividendPerShare += (dividend * magnitude) / totalSupply();
            emit DividendsDistributed(msg.sender, dividend);
        }

        (bool success, ) = payable(owner()).call{value: ownerShare}("");
        require(success, "Owner transfer failed");
    }

    function withdrawDividend() external nonReentrant {
        uint256 withdrawable = withdrawableDividendOf(msg.sender);
        require(withdrawable > 0, "No dividend available");

        withdrawnDividends[msg.sender] += withdrawable;
        emit DividendWithdrawn(msg.sender, withdrawable);

        (bool success, ) = payable(msg.sender).call{value: withdrawable}("");
        require(success, "AVAX transfer failed");
    }

    function withdrawableDividendOf(address account) public view returns(uint256) {
        return accumulativeDividendOf(account) - withdrawnDividends[account];
    }

    function accumulativeDividendOf(address account) public view returns(uint256) {
        int256 magnified = int256(magnifiedDividendPerShare * balanceOf(account));
        int256 corrected = magnified + magnifiedDividendCorrections[account];
        if (corrected < 0) return 0;
        return uint256(corrected) / magnitude;
    }

    function _afterTokenTransfer(address from, address to, uint256 amount) internal override {
        if (from != address(0)) {
            magnifiedDividendCorrections[from] += int256(magnifiedDividendPerShare * amount);
        }
        if (to != address(0)) {
            magnifiedDividendCorrections[to] -= int256(magnifiedDividendPerShare * amount);
        }
    }

    function _mint(address account, uint256 amount) internal override {
        super._mint(account, amount);
        magnifiedDividendCorrections[account] -= int256(magnifiedDividendPerShare * amount);
    }

    function _burn(address account, uint256 amount) internal override {
        super._burn(account, amount);
        magnifiedDividendCorrections[account] += int256(magnifiedDividendPerShare * amount);
    }
}
