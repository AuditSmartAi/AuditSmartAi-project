// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0; // Update the Solidity version to a safe one

contract VulnerableContract {
    mapping(address => uint256) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() external {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "Nothing to withdraw");

        try {
            (bool sent, ) = payable(msg.sender).transfer(amount);
            require(sent, "Failed to send Ether");
        } catch {
            revert("Failed to send Ether");
        }

        balances[msg.sender] = 0;
    }
}