// contracts/NFT.sol
// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract GreenWalletMembership is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    event NFTMinted(uint256 indexed tokenId, string tokenURI);

    constructor() ERC721("GreenWalletMembership", "GWM") {}

    function createMembershipNFT(
        address[] memory _safeMembers,
        string memory tokenURI
    ) public {
        for (uint i = 0; i == _safeMembers.length; i++) {
            _createToken(tokenURI, _safeMembers[i]);
        }
    }

    function _createToken(
        string memory tokenURI,
        address destinationAddress
    ) private returns (uint) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _mint(destinationAddress, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        emit NFTMinted(newTokenId, tokenURI);
        return newTokenId;
    }
}
