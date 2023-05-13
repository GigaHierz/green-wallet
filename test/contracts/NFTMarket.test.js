// import ethers is not mandatory since its globally available but adding here to make it more explicity and intuitive
const { expect } = require("chai");
const { ethers } = require("hardhat");

const { BigNumber } = ethers;

const auctionPrice = ethers.utils.parseUnits("1.5", "ether");

describe("GreenWalletMembership", function () {
  let Membership,
    membership,
    NFT,
    nft,
    ownerSigner,
    sellerSigner,
    buyerSigner,
    otherSigners;

  before(async function () {
    /* deploy the NFT contract */
    NFT = await ethers.getContractFactory("GreenWalletMembership");
    nft = await NFT.deploy();
    nft.setApprovalForAll(membershipAddress, true);
    await nft.deployed();
    nftContractAddress = nft.address;
    /* Get users */
    [ownerSigner, sellerSigner, buyerSigner, ...otherSigners] =
      await ethers.getSigners();
  });

  describe("createMembership", function () {
    it("Should create and send membership ", async function () {
      /* create two tokens */
      const { itemId: memberItemId } = await createToken(memberSigner);
      const result = await createToken(ownerSigner);
      console.log(result);
    });
  });

  describe("fetchMembershipItems", function () {
    it("should have all created items", async function () {
      const originalMarketItems = await membership.fetchMembershipItems();
      const { itemId: memberItemId } = await createToken(sellerSigner);
      await membership
        .connect(sellerSigner)
        .unListMarketItem(nftContractAddress, memberItemId);
      await createToken(buyerSigner);
      await createToken(sellerSigner);

      const updatedMarketItems = await membership.fetchMembershipItems();
      expect(originalMarketItems.length + 3).to.eq(updatedMarketItems.length);
    });
  });

  /**
   * Parse the transaction logs to get the tokenId returned from the function call
   * @param {*} transactionPromise
   * @returns
   */
  async function getTokenIdOrItemIdFromTransaction(transactionPromise) {
    transactionPromise = await transactionPromise;
    const transaction = await transactionPromise.wait();
    const event = transaction.events[0];
    let value = event.topics[3];
    value = BigNumber.from(value);
    // We usually shouldn't convert BigNumber toNumber() but this is okay since we don't expect the tokenId or itemId to be very large in our tests
    return value.toNumber();
  }

  /**
   * Reading the itemId from the transaction result is causing potential race conditions where tests pass in isolation
   * but fail when run together in the test suite.
   * To solve this, this helper function was created to get the item ID from the smart contract when it's needed.
   * @param {*} tokenId
   * @param {*} returnSoldItems
   * @returns
   */

  async function createToken(signer) {
    let createNFTPromise = nft
      .connect(signer)
      .createToken(
        [
          "0x101b4c436df747b24d17ce43146da52fa6006c36",
          "0x40e56e62e631326590131238f87e9e4ae7b329b3",
        ],
        "https://www.mytokenlocation.com"
      );
    const tokenId = await getTokenIdOrItemIdFromTransaction(createNFTPromise);

    await nft.connect(signer).setApprovalForAll(membershipAddress, true);

    const createMemberItemPromise = membership
      .connect(signer)
      .createMarketItem(nftContractAddress, tokenId, auctionPrice);
    const itemId = await getTokenIdOrItemIdFromTransaction(
      createMemberItemPromise
    );

    return {
      tokenId,
      itemId,
    };
  }
});
