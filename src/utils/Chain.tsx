/**
 * A dict that maps the chainId to the chainName, rpcUrl, and blockExplorerUrl, transaction service url
*/

export type ChainInfo = {
    chainName: string
    rpcUrl: string
    blockExplorerUrl: string
    transactionServiceUrl: string,
    symbol: string,
}

export const DEFAULT_CHAIN_ID = '5';

// value of the default destination address (vitalik.eth) (used for testing)
export const DEFAULT_DESTINATION_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

export const CHAIN_INFO: { [chainId: string]: ChainInfo } = {
    '1': {
        chainName: 'Ethereum Mainnet',
        rpcUrl: 'https://mainnet.infura.io/v3/6b9b3a0d3d1f4c8e9b1d2a0f7f0c2e7e',
        blockExplorerUrl: 'https://etherscan.io',
        transactionServiceUrl: 'https://safe-transaction-mainnet.safe.global',
        symbol: 'eth'
    },
    '5': {
        chainName: 'Goerli Testnet',
        rpcUrl: 'https://goerli.infura.io/v3/6b9b3a0d3d1f4c8e9b1d2a0f7f0c2e7e',
        blockExplorerUrl: 'https://goerli.etherscan.io',
        transactionServiceUrl: 'https://safe-transaction-goerli.safe.global',
        symbol: 'gor'
    },
    '137': {
        chainName: 'Polygon Mainnet',
        rpcUrl: 'https://rpc-mainnet.maticvigil.com',
        blockExplorerUrl: 'https://polygonscan.com',
        transactionServiceUrl: 'https://safe-transaction-polygon.safe.global',
        symbol: 'matic',
    },
    '100': {
        chainName: 'Gnosis Chain',
        rpcUrl: 'https://rpc.ankr.com/gnosis',
        blockExplorerUrl: 'https://gnosisscan.io',
        transactionServiceUrl: 'https://safe-transaction-gnosis-chain.safe.global',
        symbol: 'gno'
    },
    '56': {
        chainName: 'Binance Smart Chain',
        rpcUrl: 'https://bsc-dataseed.binance.org',
        blockExplorerUrl: 'https://bscscan.com',
        transactionServiceUrl: 'https://safe-transaction-bsc.safe.global',
        symbol: 'bnb'
    },
}


        
