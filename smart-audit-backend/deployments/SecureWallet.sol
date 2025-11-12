// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SecureWallet {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    receive() external payable {}

    function withdraw(uint amount) external {
        require(msg.sender == owner, "Not the owner");
        require(address(this).balance >= amount, "Insufficient balance");
        payable(owner).transfer(amount);
    }

    function getBalance() external view returns (uint) {
        return address(this).balance;
    }
}