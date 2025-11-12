// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SafeCounter {
    uint private count;

    function getCount() public view returns (uint) {
        return count;
    }

    function increment() public {
        count += 1;
    }

    function decrement() public {
        require(count > 0, "Count is already zero");
        count -= 1;
    }
}