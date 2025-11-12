// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ExternalCall {
    function callOther(address payable target) public payable {
        target.call{value: msg.value}(""); // return value not checked
    }
}
