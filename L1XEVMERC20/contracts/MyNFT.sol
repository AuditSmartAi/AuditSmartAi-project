// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIds = 1;

    constructor(address initialOwner)
        ERC721("AuditSmart Token", "ASTNFT")
        Ownable(initialOwner)
    {
        // constructor logic here (if any)
    }

    function mintToUser(address userWallet, string memory tokenURI) public  returns (uint256) {
        require(userWallet != address(0), "Invalid user address");

        uint256 newItemId = _tokenIds;
        _tokenIds++;

        _mint(userWallet, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }
}
