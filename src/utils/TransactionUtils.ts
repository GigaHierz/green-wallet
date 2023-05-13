import { ethers } from 'ethers'
import SafeApiKit from '@safe-global/api-kit'
import Safe, { EthersAdapter, SafeFactory, SafeAccountConfig } from '@safe-global/protocol-kit'
import { MetaTransactionData, OperationType, MetaTransactionOptions, RelayTransaction } from '@safe-global/safe-core-sdk-types'
import { GelatoRelayAdapter } from '@safe-global/relay-kit'
import { CHAIN_INFO } from './Chain'
import { SafeAuthKit, Web3AuthAdapter } from '@safe-global/auth-kit'

declare global {
    interface Window {
        ethereum:any
    }
}

export class TransactionUtils {
    
    /**
     * https://stackoverflow.com/a/1054862/5405197
     */

    static getEthAdapter = async (useSigner: boolean = true, authKit?: SafeAuthKit<Web3AuthAdapter>) => {

        // Using ethers

        let provider, signer;

        if (authKit) {
            provider = new ethers.providers.Web3Provider(authKit.getProvider()!);
            signer = provider.getSigner();
        } else {

            if (!window.ethereum) {
                throw  new  Error('No crypto wallet found. Please install it.')
            }
        
             provider = new  ethers.providers.Web3Provider(window.ethereum)
        }

        if(useSigner) {
            // Triggers the wallet to ask the user to sign in
            await  window.ethereum.send('eth_requestAccounts')
            signer = provider.getSigner()
        }

        console.log({provider, signer})

        const ethAdapter = new EthersAdapter({
            ethers,
            signerOrProvider: signer || provider
        })

        console.log({authKit}, authKit?.getProvider(), provider, signer, ethAdapter)

        return ethAdapter;
    }
    static createMultisigWallet =  async (owners: Array<string>, threshold: number) => {
        console.log({owners, threshold})

        const ethAdapter = await this.getEthAdapter();
        const chainId = await ethAdapter.getChainId();
        const chainInfo = CHAIN_INFO[chainId.toString()];
        const safeFactory = await SafeFactory.create({ ethAdapter })

        console.log({ethAdapter, safeFactory})

        const safeAccountConfig: SafeAccountConfig = {
            owners,
            threshold,
            // ... (Optional params) 
            // https://github.com/safe-global/safe-core-sdk/tree/main/packages/protocol-kit#deploysafe
        }

        /* This Safe is connected to owner 1 because the factory was initialized 
        with an adapter that had owner 1 as the signer. */
        const safe: Safe = await safeFactory.deploySafe({ safeAccountConfig })

        const safeAddress = safe.getAddress()

        console.log('Your Safe has been deployed:')
        console.log(`${chainInfo.blockExplorerUrl}/address/${safeAddress}`)
        console.log(`${chainInfo.transactionServiceUrl}/api/v1/safes/${safeAddress}`)
        console.log(`https://app.safe.global/${chainInfo.symbol}:${safeAddress}`)

        return { safe }
    }

    static createTransaction = async (safeAddress: string, destination: string, amount: number|string,
         sponsored: boolean = false, authKit?: SafeAuthKit<Web3AuthAdapter>) => {

        amount = ethers.utils.parseUnits(amount.toString(), 'ether').toString()

        const safeTransactionData: MetaTransactionData = {
            to: destination,
            data: '0x',
            value: amount
        }

        const ethAdapter = await this.getEthAdapter(true, authKit);
        const safeSDK = await Safe.create({
            ethAdapter,
            safeAddress
        })

        if (sponsored) {
            return TransactionUtils.relayTransaction(safeTransactionData, safeSDK)
        }

        const chainId = await ethAdapter.getChainId();
        const chainInfo = CHAIN_INFO[chainId.toString()];

        // Create a Safe transaction with the provided parameters
        const safeTransaction = await safeSDK.createTransaction({ safeTransactionData })

        // Deterministic hash based on transaction parameters
        const safeTxHash = await safeSDK.getTransactionHash(safeTransaction)

        // Sign transaction to verify that the transaction is coming from owner 1
        const senderSignature = await safeSDK.signTransactionHash(safeTxHash)

        const txServiceUrl = chainInfo.transactionServiceUrl;
        const safeService = new SafeApiKit({ txServiceUrl, ethAdapter })
        await safeService.proposeTransaction({
            safeAddress,
            safeTransactionData: safeTransaction.data,
            safeTxHash,
            senderAddress: (await ethAdapter.getSignerAddress())!,
            senderSignature: senderSignature.data,
        })
        console.log(`Transaction sent to the Safe Service: 
        ${chainInfo.transactionServiceUrl}/api/v1/multisig-transactions/${safeTxHash}`)
    }

    static relayTransaction = async (safeTransactionData: MetaTransactionData, safeSDK: Safe) => {

        // Create a transaction object
        safeTransactionData = {
            ...safeTransactionData,
            operation: OperationType.Call
        }

        // Usually a limit of 21000 is used but for smart contract interactions, you can increase to 100000 because of the more complex interactions.
        const gasLimit = '100000'
        const options: MetaTransactionOptions = {
            gasLimit: ethers.BigNumber.from(gasLimit),
            isSponsored: true
        }

        // Get Gelato Relay API Key: https://relay.gelato.network/
        const GELATO_RELAY_API_KEY=process.env.REACT_APP_GELATO_RELAY_API_KEY!
        const relayAdapter = new GelatoRelayAdapter(GELATO_RELAY_API_KEY)
    
        //Prepare the transaction
        const safeTransaction = await safeSDK.createTransaction({
            safeTransactionData
        })
          
        const signedSafeTx = await safeSDK.signTransaction(safeTransaction)
        
        const encodedTx = safeSDK.getContractManager().safeContract.encode('execTransaction', [
            signedSafeTx.data.to,
            signedSafeTx.data.value,
            signedSafeTx.data.data,
            signedSafeTx.data.operation,
            signedSafeTx.data.safeTxGas,
            signedSafeTx.data.baseGas,
            signedSafeTx.data.gasPrice,
            signedSafeTx.data.gasToken,
            signedSafeTx.data.refundReceiver,
            signedSafeTx.encodedSignatures()
        ])
    
        const relayTransaction: RelayTransaction = {
            target: safeSDK.getAddress(),
            encodedTransaction: encodedTx,
            chainId: await safeSDK.getChainId(),
            options
        }
        const response = await relayAdapter.relayTransaction(relayTransaction)

        console.log(`Relay Transaction Task ID: https://relay.gelato.digital/tasks/status/${response.taskId}`)
        
    }

    static confirmTransaction = async (safeAddress: string, safeTxHash: string) => {

        const ethAdapter = await this.getEthAdapter();
        const chainId = await ethAdapter.getChainId();
        const chainInfo = CHAIN_INFO[chainId.toString()];
        const txServiceUrl = chainInfo.transactionServiceUrl;
        const safeService = new SafeApiKit({ txServiceUrl, ethAdapter })
          
          const safeSdk = await Safe.create({
            ethAdapter,
            safeAddress
          })
          
          const signature = await safeSdk.signTransactionHash(safeTxHash)
          const response = await safeService.confirmTransaction(safeTxHash, signature.data)

        console.log(`Transaction confirmed to the Safe Service: 
        ${txServiceUrl}/api/v1/multisig-transactions/${safeTxHash}`)
          return response
    }

    static executeTransaction = async (safeAddress: string, safeTxHash: string) => {

        const ethAdapter = await this.getEthAdapter();
        const chainId = await ethAdapter.getChainId();
        const chainInfo = CHAIN_INFO[chainId.toString()];
        const txServiceUrl = chainInfo.transactionServiceUrl;
        const safeService = new SafeApiKit({ txServiceUrl, ethAdapter })
          
        const safeSdk = await Safe.create({
        ethAdapter,
        safeAddress
        })
          
        const safeTransaction = await safeService.getTransaction(safeTxHash)
        const executeTxResponse = await safeSdk.executeTransaction(safeTransaction)
        const receipt = await executeTxResponse.transactionResponse?.wait()!
        
        console.log('Transaction executed:')
        console.log(`${chainInfo.blockExplorerUrl}/tx/${receipt.transactionHash}`)

        console.log(`Transaction confirmed to the Safe Service: 
        ${txServiceUrl}/api/v1/multisig-transactions/${safeTxHash}`)
        return receipt
    }
}