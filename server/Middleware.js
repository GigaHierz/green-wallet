
const {CONFIG_CHAINS} = require('./Config');
const validator = require('validator');

const checkNFTRequestBody = async function (req, res, next) {

    const { nfts } = req.body;

    if (!Array.isArray(nfts) || nfts.length < 1) {
        return res.status(400).json({error: `Please pass an array of 1 or more NFT requests`});
    }

    nfts.forEach(createNFTRequest => {
      const { nft } = createNFTRequest;

      const validChainIDs = Object.keys(CONFIG_CHAINS);

        if (!validChainIDs.includes(nft.chainId)) {
            return res.status(400).json({error: `Invalid chainId, please select one of ${validChainIDs}`});
        }
        
        const activeChain = CONFIG_CHAINS[nft.chainId];
        nft.address = nft.address || activeChain.NFT_ADDRESS; // if an address isn't specified, use the default address for the chain

        if (!validator.isEthereumAddress(nft.address)) {
            return res.status(400).json({error: "Invalid smart contract address"});
        }
        if (!validator.isEthereumAddress(nft.owner)) {
            return res.status(400).json({error: "Invalid owner address"});
        }

    });

    req.body.nfts = nfts; // update the request body with changes

    next()

}

module.exports = {
    checkNFTRequestBody,
  }