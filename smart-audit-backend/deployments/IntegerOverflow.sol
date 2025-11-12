// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract IntegerOverflow {
    uint8 public count = 255;

    function increment() public {
        count += 1; // overflow here
    }
}
