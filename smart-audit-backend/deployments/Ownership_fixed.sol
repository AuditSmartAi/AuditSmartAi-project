// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Ownership {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function changeOwner(address newOwner) public {
        require(msg.sender == owner, "Not owner");
        owner = newOwner;
    }
}