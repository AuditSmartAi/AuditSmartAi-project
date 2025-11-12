// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SneakyVault {
    mapping(address => uint256) public balances;

    bool private locked;

    modifier noReentrant() {
        require(!locked, "No reentrancy");
        locked = true;
        _;
        locked = false;
    }

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(address payable to, uint256 amount) external noReentrant {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;

        // ⛔️ Trick: calling a helper that has an external call + recursion possibility
        _send(to, amount);
    }

    function _send(address payable to, uint256 amount) internal {
        // Fake "extra logic" distracts audit tools
        if (tx.gasprice > 0) {
            if (block.timestamp % 2 == 0) {
                (bool success, ) = to.call{value: amount, gas: gasleft()}(""); // added gasleft() to prevent reentrancy
                require(success, "Transfer failed");
            } else {
                (bool success, ) = to.call{value: amount, gas: gasleft()}("");
                require(success, "Transfer failed");
            }
        }
    }

    // Needed to receive ETH
    receive() external payable {
        if (balances[msg.sender] > 1 ether) {
            uint256 balance = balances[msg.sender];
            balances[msg.sender] = 0; // Update balance before withdrawal
            withdraw(payable(msg.sender), balance); // reentry path fixed
        }
    }
}