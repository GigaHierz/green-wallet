const path = require('node:path');
const ethers = require('ethers');
const {CONFIG_CHAINS} = require('./Config');
const NFT = require('../src/artifacts/contracts/NFT.sol/NFT.json');
const {getAccount, getProvider} = require('../scripts/helpers');
const { create, urlSource } = require("ipfs-http-client");
const fs = require('fs');

const projectId = process.env.INFURA_PROJECT_ID;
const projectSecret = process.env.INFURA_API_KEY;
const auth =
    'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const ipfsClient = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
});

const uploadToIPFS = async (fileUrl) => {

    const file = await ipfsClient.add(urlSource(fileUrl));
    const ipfsUrl = `https://ipfs.infura.io/ipfs/${file.cid}`;
    return ipfsUrl;
}

const createNFT = async (request) =>{


    const { nft } = request;
    const { name, description, owner, chainId, attributes } = nft;
    let { image, address } = nft;

    const activeChain = CONFIG_CHAINS[chainId]
    
    // TODO getAccount() is also calling getProvider() is this wasted duplicate effort?
    const signer = getAccount(chainId);
    const provider = getProvider(chainId);

    const gasPrice = await provider.getGasPrice();
    if (!image.includes("ipfs.")) {
        image = await uploadToIPFS(image);
    }

    const data = JSON.stringify({
        name, description, image, attributes
    });
    let tokenURI = "";

    try {
        const added = await ipfsClient.add(data)
        tokenURI = `https://ipfs.infura.io/ipfs/${added.path}`
    }
    catch (ipfsError) {
        console.log(ipfsError);
        throw new Error(`IPFSError: ${ipfsError}`);
    }
    // const url = "https://ipfs.moralis.io:2053/ipfs/QmXYfYAHxTwbY5sQJUNB2ftF5aHvxfkBUwgEKM5dSfVVLg";

    try {


        let nftContract = new ethers.Contract(address, NFT.abi, signer);
        let mintTransactionPromise = await nftContract.createTokenOnBehalfOf(tokenURI, owner, {gasPrice})
        let mintTransaction = await mintTransactionPromise.wait();
    
        let event = mintTransaction.events[0]
        let tokenId = event.args[2].toNumber();
    
        nft.tokenId = tokenId;
    
        const blockExplorerUrl = `${activeChain.BLOCK_EXPLORER_URL}/token/${activeChain.NFT_ADDRESS}?a=${tokenId}`;
        console.log("\x1b[32m%s\x1b[0m", `Succesfully Minted NFT! View in block explorer: ${blockExplorerUrl}`);

        const openseaUrl = `https://testnets.opensea.io/assets/goerli/${activeChain.NFT_ADDRESS}/${tokenId}`;
        console.log("\x1b[32m%s\x1b[0m", `View in Opensea: ${openseaUrl}`);
    
        const transactionMetadata = {
            hash: mintTransaction.transactionHash,
            to: mintTransaction.to,
            from: mintTransaction.from,
            gasUsed: mintTransaction.gasUsed,
            url: `${activeChain.BLOCK_EXPLORER_URL}/tx/${mintTransaction.transactionHash}`
        }

        return { nft, blockExplorerUrl, transaction: transactionMetadata };
    } catch (mintNFTError) {
        console.log("mintNFTError",mintNFTError);
        return { nft, error: mintNFTError };
    }
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const createNFTFromJson = async (jsonFile) => {

    // load json from file
    let nftsRaw = fs.readFileSync(jsonFile);

    let nfts = JSON.parse(nftsRaw);
    try {
        const createNFTResults = await Promise.all(nfts.map(async (createNftRequest) => {
          try {
            // wait for 1 second to avoid Error: replacement transaction underpriced
            // otherwise we get this error when we try to mint multiple NFTs in a row
            // since it will try to replace the previous transaction
            // TODO not working still getting:
            // Error: replacement transaction underpriced reason: 'replacement fee too low', code: 'REPLACEMENT_UNDERPRICED',
            await delay(1000)
            const nftResult = await createNFT(createNftRequest);
            return nftResult
          } catch (error) {
            console.error(error);
            return {error}
          }
      }));
        return {nfts: createNFTResults};
      } catch (error) {
        return error;
      }
}


process.argv.forEach(function (val, index, array) {
    console.log(index + ': ' + val);
});

const scriptName = path.basename(process.argv[1]);
const args = process.argv.slice(2);

if (scriptName === 'CreateNFT.js' && args.length > 0) {
    createNFTFromJson(args[0]).then((result) => {
        console.log(result);
    });
}

module.exports = {
    createNFT,
    createNFTFromJson,
}