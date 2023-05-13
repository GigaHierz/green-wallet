// this file is auto-generated each time scripts/deploy.js is run
const configChains = require('../src/config-chains.json');

const ALL_CONFIG_CHAINS = configChains;

let CONFIG_CHAINS= {};

// if the URL starts with art.atila.ca' then only show mainnet chains

const ENVIRONMENT_NAME = process.env.ENVIRONMENT_NAME || 8008;
Object.values(ALL_CONFIG_CHAINS)
// comment the following line if you want to test with all chains without filtering any chains out
// .filter(chain => ENVIRONMENT_NAME === "prod" ? chain.IS_MAIN_NET : !chain.IS_MAIN_NET)
.forEach(chain => {
    CONFIG_CHAINS[chain.CHAIN_ID] = chain;
});

module.exports = {
    ALL_CONFIG_CHAINS,
    CONFIG_CHAINS,
    ENVIRONMENT_NAME,
  }