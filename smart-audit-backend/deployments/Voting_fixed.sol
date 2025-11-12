// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    mapping(string => uint) public votesReceived;
    string[] public candidateList;
    mapping(string => bool) public validCandidates;

    constructor(string[] memory candidates) {
        candidateList = candidates;
        for (uint i = 0; i < candidates.length; i++) {
            validCandidates[candidates[i]] = true;
        }
    }

    function voteForCandidate(string memory candidate) public {
        require(validCandidates[candidate], "Invalid candidate");
        votesReceived[candidate] += 1;
    }
}