// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Destructible {
    function destroy() public {
        selfdestruct(payable(msg.sender)); // Anyone can call
    }
}
