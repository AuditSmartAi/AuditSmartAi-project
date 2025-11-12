// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SafeCounter {
    uint public count;

    function increment() public {
        count += 1;
    }

    function decrement() public {
        require(count > 0, "Count is zero");
        count -= 1;
    }
}
