// contracts/Market.sol
// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract NFTMarket is ReentrancyGuard {
  using Counters for Counters.Counter;
  Counters.Counter private _itemIds;
  Counters.Counter private _itemsSold;

  address payable owner;
  uint256 private salesFeeBasisPoints = 250; // 2.5% in basis points (parts per 10,000) 250/100000
  uint256 private basisPointsTotal = 10000;

  constructor() {
    owner = payable(msg.sender);
  }

  struct MarketItem {
    uint itemId;
    address nftContract;
    uint256 tokenId;
    address payable seller;
    address payable owner;
    uint256 price;
    bool sold;
  }

  mapping(uint256 => MarketItem) private idToMarketItem;
  mapping(address => uint) private credits;

  /**
    Credit the given address, using a "pull" payment strategy.
    https://fravoll.github.io/solidity-patterns/pull_over_push.html
    https://docs.openzeppelin.com/contracts/2.x/api/payment#PullPayment 
  */
  function _allowForPull(address receiver, uint amount) private {
      credits[receiver] += amount;
  }

  function withdrawCredits() public {
      uint amount = credits[msg.sender];

      require(amount > 0, "There are no credits in this recipient address");
      require(address(this).balance >= amount, "There are no credits in this contract address");

      credits[msg.sender] = 0;

      payable(msg.sender).transfer(amount);
  }

  function getAddressCredits(address receiver) public view returns (uint) {
    return credits[receiver];
  }

  function getSalesFeeBasisPoints() public view returns (uint) {
    return salesFeeBasisPoints;
  }

  event MarketItemCreated (
    uint indexed itemId,
    address indexed nftContract,
    uint256 indexed tokenId,
    address seller,
    address owner,
    uint256 price,
    bool sold
  );

  /* Places an item for sale on the marketplace */
  function createMarketItem(
    address nftContract,
    uint256 tokenId,
    uint256 price
  ) public payable nonReentrant returns (uint) {
    require(price > 0, "Price must be at least 1 wei");

    _itemIds.increment();
    uint256 itemId = _itemIds.current();

    idToMarketItem[itemId] =  MarketItem(
      itemId,
      nftContract,
      tokenId,
      payable(msg.sender),
      payable(address(this)),
      price,
      false
    );

    emit MarketItemCreated(
      itemId,
      nftContract,
      tokenId,
      msg.sender,
      address(this),
      price,
      false
    );


    IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
    return itemId;
  }

  /* Unlists an item previously listed for sale and transfer back to the seller */
  function unListMarketItem(
    address nftContract,
    uint256 itemId
  ) public payable nonReentrant {

    require(msg.sender == idToMarketItem[itemId].seller, "Only seller may unlist an item");
    uint tokenId = idToMarketItem[itemId].tokenId;
    idToMarketItem[itemId].owner = payable(msg.sender);
    IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);

  }

  /* Creates the sale of a marketplace item */
  /* Transfers ownership of the item, as well as funds between parties */
  function createMarketSale(
    address nftContract,
    uint256 itemId
    ) public payable nonReentrant {
    uint price = idToMarketItem[itemId].price;
    uint tokenId = idToMarketItem[itemId].tokenId;

    // uses the check-effects-interactions design patter. Check if sale can be made. Do the effects of the sale, then perform the sale interactions.
    // make external transfer call last.
    // https://fravoll.github.io/solidity-patterns/checks_effects_interactions.html

    require(idToMarketItem[itemId].owner == address(this), "This item is not available for sale");
    require(msg.value == price, "Please submit the asking price in order to complete the purchase");

    address seller = idToMarketItem[itemId].seller;
    // use basis points and multiply first before dividng because solidity does not support decimals
    // https://ethereum.stackexchange.com/a/55702/92254
    // https://stackoverflow.com/a/53775815/5405197
    uint marketPayment = (price * salesFeeBasisPoints)/basisPointsTotal;
    uint sellerPayment = price - marketPayment;

    // use the pull payment strategy. See function documentation for _allowForPull for more information on how this works
    // note: the funds go from the seller to the contract automatically due to msg.value 
    // we don't need to call payable(address(this)).transfer(amount);
    _allowForPull(seller, sellerPayment);
    idToMarketItem[itemId].owner = payable(msg.sender);
    idToMarketItem[itemId].sold = true;
    _itemsSold.increment();
    _allowForPull(payable(owner), marketPayment);

    IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
  }

  /* Returns all market items */
  function fetchMarketItems() public view returns (MarketItem[] memory) {
    uint itemCount = _itemIds.current();
    uint currentIndex = 0;

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint i = 0; i < itemCount; i++) {
      uint currentId = i + 1;
      MarketItem storage currentItem = idToMarketItem[currentId];
      items[currentIndex] = currentItem;
      currentIndex += 1;
    }
    return items;
  }

  /* Returns all unsold market items */
  function fetchUnSoldMarketItems() public view returns (MarketItem[] memory) {
    uint itemCount = _itemIds.current();
    uint unsoldItemCount = 0;
    uint currentIndex = 0;

    for (uint i = 0; i < itemCount; i++) {
      if (!idToMarketItem[i + 1].sold && idToMarketItem[i + 1].owner == address(this)) {
        unsoldItemCount += 1;
      }
    }

    MarketItem[] memory items = new MarketItem[](unsoldItemCount);
    for (uint i = 0; i < itemCount; i++) {
      uint currentId = i + 1;
      if (idToMarketItem[currentId].owner == address(this)) {
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
      }
    }
    return items;
  }

  /* Returns only items that a user has purchased */
  function fetchMyNFTs() public view returns (MarketItem[] memory) {
    uint totalItemCount = _itemIds.current();
    uint itemCount = 0;
    uint currentIndex = 0;

    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].owner == msg.sender) {
        itemCount += 1;
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].owner == msg.sender) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  /* Returns only items a user has created */
  function fetchItemsCreated() public view returns (MarketItem[] memory) {
    uint totalItemCount = _itemIds.current();
    uint itemCount = 0;
    uint currentIndex = 0;

    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].seller == msg.sender) {
        itemCount += 1;
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].seller == msg.sender) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;


  }
}