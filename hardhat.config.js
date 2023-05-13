/* hardhat.config.js */
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("./scripts/deploy.js");

const { getHardhatSettings } = require("./scripts/helpers.js");
const { ETHERSCAN_API_KEY } = process.env; // used to verify contracts on etherscan

module.exports = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    },
  },
  paths: {
    artifacts: './src/artifacts',
  },
  defaultNetwork: "hardhat",
  networks: getHardhatSettings().networks,
  etherscan: {
    apiKey: {
        goerli: ETHERSCAN_API_KEY,
    }
  }
}