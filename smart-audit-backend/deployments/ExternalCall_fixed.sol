// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract ExternalCall {
    function callOther(address payable target) public payable {
        (bool success, ) = target.call{value: msg.value}("");
        require(success, "External call failed");
    }
}