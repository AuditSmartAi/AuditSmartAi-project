// contracts/UnprotectedSelfdestruct.sol
pragma solidity ^0.8.0;

contract UnprotectedSelfdestruct {
    address private owner;

    constructor() {
        owner = msg.sender;
    }

    function kill() public {
        require(msg.sender == owner, "Only the contract owner can destroy the contract");
        selfdestruct(payable(owner));
    }

    receive() external payable {}
}