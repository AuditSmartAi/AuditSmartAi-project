// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is Ownable {
    function kill() public onlyOwner {
        selfdestruct(payable(msg.sender));
    }
}
