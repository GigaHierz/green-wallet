import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

import * as dotenv from "dotenv";
import { HardhatUserConfig, task } from "hardhat/config";

dotenv.config();

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = [process.env.CONTRACT_DEPLOYMENT_WALLET_PRIVATE_KEY];

  for (const account of accounts) {
    console.log(account.address);
  }
});

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",

  solidity: "0.8.4",
  networks: {
    hardhat: {
      forking: {
        url:
          process.env.NODE_PROVIDER_MATIC_RPC_URL ||
          "https://matic-mainnet.chainstacklabs.com",
      },
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  mocha: {
    timeout: process.env.TEST_TIMEOUT || 300000,
  },
};

export default config;
