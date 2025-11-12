// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    mapping(string => uint) public votesReceived;
    string[] public candidateList;

    constructor(string[] memory candidates) {
        candidateList = candidates;
    }

    function voteForCandidate(string memory candidate) public {
        require(validCandidate(candidate), "Invalid candidate");
        votesReceived[candidate] += 1;
    }

    function validCandidate(string memory candidate) view public returns (bool) {
        for(uint i = 0; i < candidateList.length; i++) {
            if(keccak256(bytes(candidateList[i])) == keccak256(bytes(candidate))) {
                return true;
            }
        }
        return false;
    }
}
