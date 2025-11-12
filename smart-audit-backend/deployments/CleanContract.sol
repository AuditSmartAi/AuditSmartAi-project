// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract OverflowVulnerable {
    mapping(address => uint256) public balances;

    function addBalance(uint256 amount) public {
        // ❌ Vulnerability: Overflow not checked in Solidity < 0.8
        balances[msg.sender] += amount;
    }

    function subtractBalance(uint256 amount) public {
        // ❌ Vulnerability: Underflow
        balances[msg.sender] -= amount;
    }
}
