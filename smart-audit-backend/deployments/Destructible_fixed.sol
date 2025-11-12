// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Destructible {
    address payable private owner;

    constructor() {
        owner = payable(msg.sender);
    }

    function destroy() public {
        require(msg.sender == owner, "Only the contract owner can destroy the contract");
        selfdestruct(owner);
    }
}