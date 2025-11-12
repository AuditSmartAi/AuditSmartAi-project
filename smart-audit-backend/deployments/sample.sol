// contracts/UnprotectedSelfdestruct.sol
pragma solidity ^0.8.0;

contract UnprotectedSelfdestruct {
    function kill() public {
        selfdestruct(payable(msg.sender)); // anyone can destroy the contract
    }

    receive() external payable {}
}
