import React, { useEffect, useState } from 'react';
import { SafeAuthKit, SafeAuthSignInData, Web3AuthAdapter, Web3AuthEventListener } from '@safe-global/auth-kit';
import { Web3AuthOptions } from '@web3auth/modal';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import { ADAPTER_EVENTS, CHAIN_NAMESPACES, SafeEventEmitterProvider, WALLET_ADAPTERS } from '@web3auth/base';

const connectedHandler: Web3AuthEventListener = (data) => console.log('CONNECTED', data)
const disconnectedHandler: Web3AuthEventListener = (data) => console.log('DISCONNECTED', data)

function AccountManage({onLoggedIn}: {onLoggedIn?: (account: SafeAuthKit<Web3AuthAdapter>) => void}) {

  const [safeAuthSignInResponse, setSafeAuthSignInResponse] = useState<SafeAuthSignInData | null>(
    null
  )
  const [safeAuth, setSafeAuth] = useState<SafeAuthKit<Web3AuthAdapter>>()
  const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null)

  useEffect(() => {
    ;(async () => {

      // https://dashboard.web3auth.io/
      const WEB3_AUTH_CLIENT_ID=process.env.REACT_APP_WEB3_AUTH_CLIENT_ID!

      // https://web3auth.io/docs/sdk/web/modal/initialize#arguments
      const options: Web3AuthOptions = {
        clientId: WEB3_AUTH_CLIENT_ID,
        web3AuthNetwork: 'testnet',
        chainConfig: {
          chainNamespace: CHAIN_NAMESPACES.EIP155,
          chainId: '0x5',
          // https://chainlist.org/
          rpcTarget: `https://rpc.ankr.com/eth_goerli`
        },
        uiConfig: {
          theme: 'dark',
          loginMethodsOrder: ['google', 'facebook']
        }
      }

      // https://web3auth.io/docs/sdk/web/modal/initialize#configuring-adapters
      const modalConfig = {
        [WALLET_ADAPTERS.TORUS_EVM]: {
          label: 'torus',
          showOnModal: false
        },
        [WALLET_ADAPTERS.METAMASK]: {
          label: 'metamask',
          showOnDesktop: true,
          showOnMobile: false
        }
      }

      // https://web3auth.io/docs/sdk/web/modal/whitelabel#whitelabeling-while-modal-initialization
      const openloginAdapter = new OpenloginAdapter({
        loginSettings: {
          mfaLevel: 'mandatory'
        },
        adapterSettings: {
          uxMode: 'popup',
          whiteLabel: {
            name: 'Safe'
          }
        }
      })

      const adapter = new Web3AuthAdapter(options, [openloginAdapter], modalConfig)

      const safeAuthKit = await SafeAuthKit.init(adapter, {
        txServiceUrl: 'https://safe-transaction-goerli.safe.global'
      })


      console.log({safeAuthKit})

      safeAuthKit.subscribe(ADAPTER_EVENTS.CONNECTED, connectedHandler)

      safeAuthKit.subscribe(ADAPTER_EVENTS.DISCONNECTED, disconnectedHandler)

      setSafeAuth(safeAuthKit)

      return () => {
        safeAuthKit.unsubscribe(ADAPTER_EVENTS.CONNECTED, connectedHandler)
        safeAuthKit.unsubscribe(ADAPTER_EVENTS.DISCONNECTED, disconnectedHandler)
      }
    })()
  }, [])

  const login = async () => {
    if (!safeAuth) return

    const response = await safeAuth.signIn()
    console.log('SIGN IN RESPONSE: ', response)

    setSafeAuthSignInResponse(response)
    setProvider(safeAuth.getProvider() as SafeEventEmitterProvider)
    console.log('PROVIDER: ', provider)
    onLoggedIn?.(safeAuth)
  }

  const logout = async () => {
    if (!safeAuth) return

    await safeAuth.signOut()

    setProvider(null)
    setSafeAuthSignInResponse(null)
  }

  return (
    <div>
    <div className='EventDetail container card shadow my-5 p-5'>
        <h1 className='text-center mb-3'>
                Create an Account
        </h1>
        <button
          type="button"
          className="btn btn-primary my-2"
          onClick={login}
        >
          Log In
        </button>
        <button
          type="button"
          className="btn btn-outline-primary my-2"
          onClick={logout}
        >
          Log Out
        </button>

        {safeAuthSignInResponse && 
        <div className="alert alert-success" role="alert">
          Successful Login for User: {safeAuthSignInResponse.eoa}
          <hr />
          Safe's Owned: {safeAuthSignInResponse.safes?.join('\n')}
        </div>
          
        }

        
    </div>
    </div>
  );
}

export default AccountManage;
