// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Escrow {
    address public payer;
    address public payee;
    address public lawyer;
    uint public amount;

    constructor(address _payer, address _payee, uint _amount) {
        payer = _payer;
        payee = _payee;
        lawyer = msg.sender;
        amount = _amount;
    }

    receive() external payable {
        require(msg.sender == payer, "Sender must be payer");
        require(address(this).balance <= amount, "Too much Ether sent");
    }

    function release() public {
        require(msg.sender == lawyer, "Only lawyer can release funds");
        require(address(this).balance == amount, "Cannot release before full amount is sent");
        payable(payee).transfer(amount);
    }
}
