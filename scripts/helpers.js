const { ethers } = require("ethers");
const fs = require('fs');
const { CONTRACT_DEPLOYMENT_WALLET_PRIVATE_KEY, INFURA_API_KEY} = process.env;

const chainConfigFilePath = './src/config-chains.json';
// Helper method for fetching a connection provider to the Ethereum network
function getAvailableChains() {
    let chainConfigRaw = fs.readFileSync(chainConfigFilePath);

    let chainConfigs = JSON.parse(chainConfigRaw);
    return chainConfigs
}

const getHardhatSettings = () => {

  const chainConfigs = getAvailableChains();

  const networks = {};
  
  Object.values(chainConfigs).forEach(chainConfig => {
    networks[(chainConfig.NETWORK_NAME).toLowerCase()] = {
      url: chainConfig.RPC_URL,
      accounts: [`0x${CONTRACT_DEPLOYMENT_WALLET_PRIVATE_KEY}`],
      chainId: Number.parseInt(chainConfig.CHAIN_ID),
    }
  });

  return {
    networks,
  }
  
}

// Helper method for fetching a connection provider to the Ethereum network
function getNetworkSetting(chainId) {
    return Object.values(getHardhatSettings().networks).find(chainSettings => chainSettings.chainId == chainId);
}


// Helper method for fetching a connection provider to the Ethereum network
function getProvider(chainId) {
    const hardhatChainNetwork = getNetworkSetting(chainId);
    return ethers.getDefaultProvider(hardhatChainNetwork?.url);
}

// Helper method for fetching a wallet account using an environment variable for the PK
function getAccount(chainId) {

    const hardhatChainNetwork = getNetworkSetting(chainId);
    if (!hardhatChainNetwork) {
        console.error("\x1b[33m%s\x1b[0m", `No matching chainId found for network: '${chainId}', using localhost.`);
        return null
    }
    return new ethers.Wallet(hardhatChainNetwork? hardhatChainNetwork.accounts[0]:"", getProvider(chainId));
}

module.exports = {
    getAvailableChains,
    chainConfigFilePath,
    getProvider,
    getAccount,
    getNetworkSetting,
    getHardhatSettings
}