// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TimeLock {
    address public beneficiary;
    uint public releaseTime;

    constructor(address _beneficiary, uint _releaseTime) {
        require(_releaseTime > block.timestamp, "Release time is before current time");
        beneficiary = _beneficiary;
        releaseTime = _releaseTime;
    }

    receive() external payable {}

    function release() public {
        require(block.timestamp >= releaseTime, "Too early");
        (bool success, ) = payable(beneficiary).call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }
}