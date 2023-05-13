const express = require('express');
const dotenv = require('dotenv');
const createNFT = require('./CreateNFT').createNFT;
const bodyParser = require('body-parser');
const checkNFTRequestBody = require('./Middleware').checkNFTRequestBody;
const ENVIRONMENT_NAME = require('./Config').ENVIRONMENT_NAME;

dotenv.config();

const app = express();
app.use(bodyParser.json());


app.post('/api/v1/nft', 
checkNFTRequestBody,
async (req, res) => {

  let createNFTResults = [];

  const createNFTRequests = req.body.nfts;
  try {
    createNFTResults = await Promise.all(createNFTRequests.map(async (createNftRequest) => {
      try {
        const nftResult = await createNFT(createNftRequest);
        return nftResult
      } catch (error) {
        return {error}
      }
  }));
    return res.json({nfts, search_credits_available});
  } catch (error) {
    return res.status(400).json({error});
  }
});

app.get('/', (req, res) => {

  const repoUrl = "https://github.com/5afe/safe-space";
  const repoUrlHTML = `<a href="${repoUrl}" target="_blank" rel="noreferrer">${repoUrl}</a>`
  return res.send(`Welcome to the Safe Space API. 
  For more instructions on how to use this API see ${repoUrlHTML}`);
});

/*uncomment if you want to test locally UNCCOMMENT_LINES_BELOW*/
const port = process.env.PORT || 8008;

app.listen(port, () => {
  console.log(`⚡️[server] is running at http://localhost:${port}`);
});
