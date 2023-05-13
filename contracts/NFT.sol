// contracts/NFT.sol
// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    event NFTMinted (
        uint256 indexed tokenId,
        string tokenURI
    );
    constructor() ERC721("Safe Space NFT", "SAFENFT") {}

    function createToken(string memory tokenURI) public returns (uint) {
        return _createToken(tokenURI, msg.sender);
    }

    function createTokenOnBehalfOf(string memory tokenURI, address destinationAddress) public returns (uint) {
        return _createToken(tokenURI, destinationAddress);
    }

    function _createToken(string memory tokenURI, address destinationAddress) private returns (uint) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _mint(destinationAddress, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        emit NFTMinted(newTokenId, tokenURI);
        return newTokenId;
    }
}