// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

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

    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) Ownable(msg.sender) {
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

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) public onlyOwner {
        _burn(from, amount);
    }

    // Getter functions for testing
    function getMagnifiedDividendPerShare() public view returns (uint256) {
        return magnifiedDividendPerShare;
    }

    function getMagnifiedDividendCorrections(address account) public view returns (int256) {
        return magnifiedDividendCorrections[account];
    }

    function getWithdrawnDividends(address account) public view returns (uint256) {
        return withdrawnDividends[account];
    }

    function _update(address from, address to, uint256 value) internal override {
        super._update(from, to, value);
        
        if (from != address(0)) {
            magnifiedDividendCorrections[from] += int256(magnifiedDividendPerShare * value);
        }
        if (to != address(0)) {
            magnifiedDividendCorrections[to] -= int256(magnifiedDividendPerShare * value);
        }
    }
}
