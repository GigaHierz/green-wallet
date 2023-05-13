# Green Wallet

- Https://GitHub.com/vmlvaske
- https://github.com/IreneBa26
- https://github.com/i-am-sam-codes
- https://github.com/GigaHierz
- https://github.com/zoefleischer

## Quickstart

```
git clone https://github.com/5afe/safe-space
cd safe-space
# git checkout <version> #optional if you want to use a specific version e.g. git checkout 0.4.0
yarn install
yarn start
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Deploying smart contracts

1. Get some tokens to pay the gas fees for deploying the smart contracts:
   1. Ethereum Goerli: https://goerlifaucet.com

```bash
cp example.env .env
touch .privatekey
# put environment variables in .env and .privatekey
source.env
npx hardhat deploy --chain-id 5
```

1. Deploy the smart contract: `npx hardhat deploy --chain-id [chainId]`
   1. If you want to deploy just the NFT or the Market without deploying everything run:
      1. `npx hardhat deploy:nft --chain-id [chainId]`
      1. `npx hardhat deploy:market --chain-id [chainId]`
   1. Here are some examples:
      1. Ethereum Goerli: `npx hardhat deploy --chain-id 5`

### Verifying Smart Contract on Etherscan

1. Get Etherscan API Key: https://etherscan.io/myapikey
   1. Similar process for Other networks
1. Set environment variable in `.secrets`: `export ETHERSCAN_API_KEY=""`
1. `npx hardhat verify --network goerli [smart_contract_address_you_just deployed]`
   1. Example: `npx hardhat verify --network goerli 0x85942528541a1d7db9e9d84a074d0b2204c94b5a`
   1. To see a list of other networks: `npx hardhat verify --list-networks`

## Contracts

1. NFT Marketplace: https://goerli.etherscan.io/address/0xa0a3c753387050d1949d6b8db672fff724b635c1#code

1. NFT: https://goerli.etherscan.io/address/0x85942528541a1d7db9e9d84a074d0b2204c94b5a#code

## Deploying an NFT to an existing Smart Contract

1. Get your infura API key.
1. Add it to `.env`
1. Edit `server/nfts.json`


## Project Descriptions

Short Description:
GreenWallet is an ecofriendly, chain-agnostic wallet that accounts for your blockchain transactions by offsetting your carbon footprint.

Full Description:
GreenWallet is a chain-agnostic DeFi app that simplifies eco-friendliness by automating carbon offsets for blockchain transactions.
GreenWallet aims to give the environmentally aware user a clean consciousness while browsing web3.
While the user has a seamless experience, GreenWallets mechanisms track all the transactions across chains and calculate the according carbon footprint.
We are specifically targeting a tech-savvy audience that cares about their environmental impact. While some web3 experience is necessary to use GreenWallet, we aim at an user-friendly and simple Inetrface.
Users can maximize their agency over their carbon impact by inspecting  analytics of their wallet transactions. These will give them visually digested information about the when, where and how of their carbon footprint creation.
Every holder receives a NFT as proof of GreenWallet membership.
Lastly the wallet integrates with Lens Protocol to allow display of your NFT carbon offset badge.

Pitch:
We are building an eco-friendly wallet that automatically offsets your carbon footprint cross-chain by tracking your wallet activity. Aiming to provide a seamless opportunity for environmentally conscious users to improve their social impact.


```bash
source .env
node server/CreateNFT.js 'server/nfts.json'
```
