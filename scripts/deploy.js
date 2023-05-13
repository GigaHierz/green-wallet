// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
// const hre = require("hardhat");
const { task } = require("hardhat/config");
const fs = require('fs');
const { getAvailableChains, chainConfigFilePath, getAccount, getProvider } = require("./helpers");


task("deploy:nft", "Deploys the NFT.sol contract")
.addParam("chainId", "The Chain ID of the blockchain where this contract will be deployed.")
.setAction(async function (taskArguments, hre) {

  const availableChains = getAvailableChains();
  const { chainId } = taskArguments;

  if (!(chainId in availableChains)) {
    // characters at the beginning to make error print in a different color
    // https://stackoverflow.com/a/41407246/5405197
    let chainsForPrinting = {};
    Object.values(availableChains).forEach(chain=>{chainsForPrinting[chain.CHAIN_ID]= `${chain.CHAIN_NAME} (${chain.NETWORK_NAME})`});
    chainsForPrinting = JSON.stringify(chainsForPrinting, null, 4);

    console.error("\x1b[31m%s\x1b[0m", `Invalid chainId: ${chainId}.\nPlease select one of the following:\n${chainsForPrinting}`);
    process.exit(1);
  }
  const account = getAccount(chainId);
  const provider = getProvider(chainId);
  const gasPrice = await provider.getGasPrice();
  let NFT;
  if (account) {
    NFT = await hre.ethers.getContractFactory("NFT", account);
  } else {
    NFT = await hre.ethers.getContractFactory("NFT");
  }
  
  const nft = await NFT.deploy({gasPrice});
  await nft.deployed();

  availableChains[chainId].NFT_ADDRESS = nft.address.toLowerCase();
  fs.writeFileSync(chainConfigFilePath, JSON.stringify(availableChains, null, 4));

  const chainConfig = availableChains[chainId];
  console.log("\x1b[32m%s\x1b[0m", `NFT deployed to ${chainConfig.CHAIN_NAME} (${chainConfig.NETWORK_NAME}): ${chainConfig.NFT_ADDRESS}`);
  console.log("\x1b[32m%s\x1b[0m", `View in block explorer: ${chainConfig.BLOCK_EXPLORER_URL}/address/${chainConfig.NFT_ADDRESS}`);

});

task("deploy:market", "Deploys the Market.sol contract")
.addParam("chainId", "The Chain ID of the blockchain where this contract will be deployed.")
.setAction(async function (taskArguments, hre) {

  const availableChains = getAvailableChains();
  const { chainId } = taskArguments;

  if (!(chainId in availableChains)) {
    let chainsForPrinting = {};
    Object.values(availableChains).forEach(chain=>{chainsForPrinting[chain.CHAIN_ID]= `${chain.CHAIN_NAME} (${chain.NETWORK_NAME})`});
    chainsForPrinting = JSON.stringify(chainsForPrinting, null, 4);

    console.error("\x1b[31m%s\x1b[0m", `Invalid chainId: ${chainId}.\nPlease select one of the following:\n${chainsForPrinting}`);
    process.exit(1);
  }

  const account = getAccount(chainId);
  const provider = getProvider(chainId);
  console.log({provider});
  let gasPrice;
  
  try {
    gasPrice = await provider.getGasPrice();
  } catch (e) {
    console.error("\x1b[31m%s\x1b[0m", `Could not get gas price. Please check your network connection. ${e}}`);
    gasPrice = null;
  }
  
  let NFTMarket;
  if (account) {
    NFTMarket = await hre.ethers.getContractFactory("NFTMarket", account);
  } else {
    NFTMarket = await hre.ethers.getContractFactory("NFTMarket");
  }
  let nftMarket;

  if (gasPrice) {
    nftMarket = await NFTMarket.deploy({gasPrice});
  } else {
    nftMarket = await NFTMarket.deploy();
  }
  await nftMarket.deployed();


  availableChains[chainId].NFT_MARKETPLACE_ADDRESS = nftMarket.address.toLowerCase();
  fs.writeFileSync(chainConfigFilePath, JSON.stringify(availableChains, null, 4));

  const chainConfig = availableChains[chainId];
  console.log("\x1b[32m%s\x1b[0m", `NFTMarket deployed to ${chainConfig.CHAIN_NAME} (${chainConfig.NETWORK_NAME}): ${chainConfig.NFT_MARKETPLACE_ADDRESS}`);
  console.log("\x1b[32m%s\x1b[0m", `View in block explorer: ${chainConfig.BLOCK_EXPLORER_URL}/address/${chainConfig.NFT_MARKETPLACE_ADDRESS}`);

});

task("deploy", "Deploys the Market.sol and NFT.sol contract")
.addParam("chainId", "The Chain ID of the blockchain where this contract will be deployed.")
.setAction(
  async (taskArgs, hre) => {
    await hre.run("deploy:market", taskArgs);
    await hre.run("deploy:nft", taskArgs);
  }
);
