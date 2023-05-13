import { ethers } from 'ethers';
import SafeApiKit from '@safe-global/api-kit';
import React, { useEffect, useState } from 'react'
import { TransactionUtils } from '../../utils/TransactionUtils';
import { CHAIN_INFO, DEFAULT_CHAIN_ID } from '../../utils/Chain';

function ReviewTransactions() {

  // initialize list of pending transactions
    const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);
  // initialize transaction service url with useState
  const [txServiceUrl, setTransactionServiceUrl] = useState<string>(CHAIN_INFO[DEFAULT_CHAIN_ID].transactionServiceUrl);

    
    // get safe address from local storage
    const safeAddress = localStorage.getItem('safeAddress') || '';

    useEffect(() => {

        async function getPendingTransactions() {
            const ethAdapter = await TransactionUtils.getEthAdapter(false)


            const chainId = await ethAdapter.getChainId();
            const chainInfo = CHAIN_INFO[chainId.toString()];
            let updatedTxServiceUrl = chainInfo.transactionServiceUrl;
            setTransactionServiceUrl(updatedTxServiceUrl);
            
            const safeService = new SafeApiKit({ txServiceUrl: updatedTxServiceUrl, ethAdapter })
            console.log({safeAddress, safeService});
            const pendingTransactionsResults = (await safeService.getPendingTransactions(safeAddress)).results
            setPendingTransactions(pendingTransactionsResults);
          }
      
          getPendingTransactions()
    }, [safeAddress, txServiceUrl])

    const confirmTransacton = async (event: React.MouseEvent<HTMLButtonElement>, transactionHash: string) => {
        event.preventDefault();
        const response = await TransactionUtils.confirmTransaction(safeAddress, transactionHash)
        console.log(response);
    }

    const executeTransaction = async (event: React.MouseEvent<HTMLButtonElement>, transactionHash: string) => {
        event.preventDefault();
        const response = await TransactionUtils.executeTransaction(safeAddress, transactionHash)
        console.log(response);
    }
    
  return (
    <div>
        Pending Transactions

        <table className="table table-striped overflow-auto">
            <thead>
            <tr>
                <th>Hash</th>
                <th>Destination</th>
                <th>Amount</th>
                <th>Time</th>
                <th>Action</th>
            </tr>
            </thead>
            <tbody>
            {pendingTransactions.map((transaction) => (
                <tr key={transaction.hash}>
                    <td>
                        <a href={`${txServiceUrl}/api/v1/multisig-transactions/${transaction.safeTxHash}`} 
                            target="_blank" rel="noreferrer">
                            {`${transaction.safeTxHash.substring(0, 6)}...${transaction.safeTxHash.substring(transaction.safeTxHash.length - 4)}`}
                        </a>
                    </td>
                    <td>{transaction.to}</td>
                    <td>{ethers.utils.formatUnits(transaction.value)}</td>
                    <td>{new Date(transaction.submissionDate).toLocaleDateString()}{' '}{new Date(transaction.submissionDate).toLocaleTimeString()}</td>
                    <td>
                        <button className="btn btn-primary btn-success my-2" 
                        onClick={(event)=>confirmTransacton(event, transaction.safeTxHash)}>Confirm</button>

                        {
                            transaction.confirmationsRequired === transaction.confirmations.length &&
                            <button className="btn btn-primary btn-success my-2" 
                                onClick={(event)=>executeTransaction(event, transaction.safeTxHash)}>
                                    Execute
                            </button>
                        }
                    </td>
                </tr>
            ))}
            </tbody>
        </table>

    </div>
  )
}

export default ReviewTransactions