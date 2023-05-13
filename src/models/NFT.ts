import { BigNumber } from "ethers";

export interface NFTAttribute {
    trait_type: string,
    value: string,
    display_type?: string,
}

export interface NFTMetadata {
    name: string,
    image: string,
    description: string,
    attributes?: NFTAttribute[],
    chainId: string,
    owner: string,
    address: string,
    // following properties only exist if the NFT has been minted
    tokenId?: string,
    tokenURI?: string,
    // following properties only exist if the NFT is listed for sale
    price?: BigNumber,
    seller?: string,
    itemId?: string,
}