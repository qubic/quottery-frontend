import {useContext, useState} from 'react'
import {QubicVault} from '@qubic-lib/qubic-ts-vault-library'
import Card from '../Card'
import {useQubicConnect} from '../../../contexts/QubicConnectContext'
import QubicConnectLogo from '../../../assets/qubic-connect.svg'
import CloseIcon from '../../../assets/close.svg'
import {useConfig} from '../../../contexts/ConfigContext'
import {useWalletConnectContext} from '../../../contexts/WalletConnectContext'
import {MetamaskActions, MetaMaskContext} from '../../../contexts/MetamaskContext'
import QRCode from 'qrcode'
import {useQuotteryContext} from '../../../contexts/QuotteryContext'
import {truncateMiddle} from "../util"
import metamaskIcon from "../../../assets/metamask.svg"
import walletConnectIcon from "../../../assets/wallet-connect.svg"

const ConnectModal = ({ open, onClose }) => {
  const [selectedWalletMode, setSelectedWalletMode] = useState('none')
  const [selectedServerMode, setSelectedServerMode] = useState('none')

  // Private seed handling
  const [privateSeed, setPrivateSeed] = useState('')
  const [errorMsgPrivateSeed, setErrorMsgPrivateSeed] = useState('')

  // Vault file handling
  const [vault] = useState(new QubicVault())
  const [selectedFile, setSelectedFile] = useState(null)
  const [password, setPassword] = useState('')
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState(0)

  // General connect/disconnect
  const {connect, disconnect, connected} = useQubicConnect()
  const {walletPublicIdentity} = useQuotteryContext()
  const [copied, setCopied] = useState(false)

  // WalletConnect handling
  const {
    connect: wcConnect,
    isConnected: wcIsConnected,
    requestAccounts,
    disconnect: wcDisconnect
  } = useWalletConnectContext()
  const [wcUri, setWcUri] = useState('')
  const [wcQrCode, setWcQrCode] = useState('')
  const [wcIsConnecting, setWcIsConnecting] = useState(false)

  // MetaMask handling
  const [mmState, mmDispatch, {connectSnap, getSnap}] = useContext(MetaMaskContext)

  // Server config handling
  const {httpEndpoint, backendUrl, updateEndpoints, connectedToCustomServer, resetEndpoints} = useConfig()
  const [httpEndpointInput, setHttpEndpointInput] = useState('')
  const [backendUrlInput, setBackendUrlInput] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // **Private Seed Connection**
  const privateKeyConnect = () => {
    if (!errorMsgPrivateSeed && privateSeed.length === 55) {
      connect({
        connectType: 'privateKey',
        publicKey: 'TEMPORARY_UNKNOWN',
        privateKey: privateSeed,
      })
      setSelectedWalletMode('none')
      setPrivateSeed('')
      onClose()
    }
  }

  const privateKeyValidate = (pk) => {
    setPrivateSeed(pk)
    if (pk.length !== 55) {
      setErrorMsgPrivateSeed('Seed must be 55 characters long')
    } else if (pk.match(/[^a-z]/)) {
      setErrorMsgPrivateSeed('Seed must contain only lowercase letters')
    } else {
      setErrorMsgPrivateSeed('')
    }
  }

  // **Vault File Connection**
  const vaultFileConnect = async () => {
    if (!selectedFile || !password) {
      alert('Please select a file and enter a password.')
      return
    }

    const fileReader = new FileReader()
    fileReader.onload = async () => {
      try {
        await vault.importAndUnlock(true, password, null, selectedFile, true)
        const accountList = vault.getSeeds().filter((account) => !account.isOnlyWatch)
        if (accountList.length === 0) {
          throw new Error('No eligible accounts found. Only watch-only accounts are listed in the vault file.')
        }
        setAccounts(accountList)
        setSelectedWalletMode('account-select')
      } catch (error) {
        console.error('Error unlocking vault:', error)
        alert('Failed to unlock the vault. Please check your password and try again.')
      }
    }
    fileReader.onerror = (error) => {
      console.error('Error reading file:', error)
      alert('Failed to read the file. Please try again.')
    }
    fileReader.readAsArrayBuffer(selectedFile)
  }

  const selectAccount = async () => {
    const selectedAcc = accounts[parseInt(selectedAccount)]
    const pkSeed = await vault.revealSeed(selectedAcc.publicId)
    connect({
      connectType: 'vaultFile',
      publicKey: selectedAcc.publicId,
      privateKey: pkSeed,
    })
    setSelectedWalletMode('none')
    onClose()
  }

  // **MetaMask Connection**
  const connectMetamask = async () => {
    try {
      await connectSnap()
      const installedSnap = await getSnap()
      mmDispatch({type: MetamaskActions.SetInstalled, payload: installedSnap})
      const pubId = await window.ethereum.request({
        method: 'wallet_invokeSnap',
        params: {
          snapId: installedSnap?.id,
          request: {
            method: 'getPublicId',
            params: { accountIdx: 0, confirm: false },
          },
        },
      })
      connect({
        connectType: 'mmSnap',
        publicKey: pubId,
      })
      setSelectedWalletMode('none')
      onClose()
    } catch (err) {
      console.error('Failed to connect MetaMask snap:', err)
      mmDispatch({type: MetamaskActions.SetError, payload: err})
    }
  }

  // **WalletConnect Connection**
  const startWalletConnect = async () => {
    setWcIsConnecting(true)
    try {
      const {uri, approval} = await wcConnect()
      if (uri) {
        setWcUri(uri)
        const qrData = await QRCode.toDataURL(uri)
        setWcQrCode(qrData)
      } else {
        console.warn('[WC] No new URI returned. Possibly existing session')
      }
      setWcIsConnecting(false)
      await approval()
    } catch (err) {
      console.error('Failed WalletConnect flow:', err)
      setWcIsConnecting(false)
    }
  }

  const connectWalletConnect = async () => {
    try {
      const accounts = await requestAccounts()
      if (!accounts || accounts.length === 0) {
        console.error('No accounts found from Qubic wallet')
        return
      }
      connect({
        connectType: 'walletconnect',
        publicKey: accounts[0].address,
      })
      setSelectedWalletMode('none')
      onClose()
    } catch (err) {
      console.error('WC connect error:', err)
    }
  }

  // **Copy Public Identity**
  const handleCopyClick = () => {
    if (walletPublicIdentity) {
      navigator.clipboard.writeText(walletPublicIdentity)
      setCopied(true)
      setTimeout(() => setCopied(false), 5000)
    }
  }

  // **Server Configuration Handlers**
  const handleServerConnect = () => {
    if (!httpEndpointInput || !backendUrlInput) {
      setErrorMsg('Please enter both HTTP Endpoint and Backend URL.')
      return
    }
    try {
      new URL(httpEndpointInput)
      new URL(backendUrlInput)
    } catch (_) {
      setErrorMsg('Please enter valid URLs.')
      return
    }
    updateEndpoints(httpEndpointInput, backendUrlInput)
    setSelectedServerMode('none')
    onClose()

    // Force page reload to apply new server settings
    window.location.reload()
  }

  const handleServerDisconnect = () => {
    resetEndpoints()
    setSelectedServerMode('none')
    onClose()

    // Force page reload to apply default settings
    window.location.reload()
  }

  return (
    <>
      {open && (
        <div
          className="w-full p-5 h-full fixed top-0 left-0 overflow-x-hidden overflow-y-auto z-50 bg-smoke-light flex"
          onClick={() => {
            setSelectedServerMode('none')
            setSelectedWalletMode('none')
            onClose()
          }}
        >
          <Card className="relative p-8 w-full max-w-md m-auto flex-col flex" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <img src={QubicConnectLogo} alt="Qubic Connect Logo" className="h-6"/>
              <img src={CloseIcon} onClick={onClose} alt="Close Modal Icon" className="w-5 h-5 cursor-pointer"/>
            </div>

            <div className="mt-4">
              {connected ? (
                <div className="space-y-4">
                  <p className="font-bold text-white">Connected as:</p>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-white">
                      {truncateMiddle(walletPublicIdentity, 40)}
                    </span>
                    <button
                      onClick={handleCopyClick}
                      className="p-1 hover:bg-gray-600 rounded"
                      title="Copy full address"
                    >
                      {copied ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-green-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-7.39 7.39a1 1 0 01-1.414 0l-3.29-3.29a1 1 0 011.414-1.414l2.583 2.583 6.683-6.683a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="1em"
                          height="1em"
                          fill="currentColor"
                        >
                          <path
                            d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m0 16H8V7h11z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  <button
                    className="bg-primary-40 p-4 rounded-lg text-black w-full text-center"
                    onClick={() => {
                      disconnect()
                      onClose()
                    }}
                  >
                    Lock Wallet
                  </button>
                </div>
              ) : (
                selectedWalletMode === 'none' && selectedServerMode === 'none' && (
                  <div className="flex flex-col gap-4">
                    <button
                      className="bg-primary-40 text-black p-3 rounded-lg w-full relative"
                      onClick={() => {
                        setSelectedServerMode('none')
                        setSelectedWalletMode('metamask')
                      }}
                    >
                      <img
                        src={metamaskIcon}
                        alt="Metamask Icon"
                        className="h-6 w-6 absolute left-3 top-1/2 transform -translate-y-1/2"
                      />
                      <span className="block text-center">Connect with MetaMask</span>
                    </button>
                    <button
                      className="bg-primary-40 text-black p-3 rounded-lg w-full relative"
                      onClick={() => {
                        setSelectedServerMode('none')
                        setSelectedWalletMode('walletconnect')
                        startWalletConnect()
                      }}
                    >
                      <img
                        src={walletConnectIcon}
                        alt="WalletConnect Icon"
                        className="h-6 w-6 absolute left-3 top-1/2 transform -translate-y-1/2"
                      />
                      <span className="block text-center">Connect with WalletConnect</span>
                    </button>
                    <div className="my-4 flex w-full items-center justify-center">
                      <div className="flex-grow border-t border-gray-500"></div>
                      <span className="px-4 text-sm text-gray-300">OR ⚠️ DANGER ⚠️</span>
                      <div className="flex-grow border-t border-gray-500"></div>
                    </div>
                    <button
                      className="bg-primary-40 text-black p-4 rounded-lg text-center"
                      onClick={() => {
                        setSelectedServerMode('none')
                        setSelectedWalletMode('private-seed')
                      }}
                    >
                      Private Seed
                    </button>
                    <button
                      className="bg-primary-40 text-black p-4 rounded-lg text-center"
                      onClick={() => {
                        setSelectedServerMode('none')
                        setSelectedWalletMode('vault-file')
                      }}
                    >
                      Vault File
                    </button>
                  </div>
                )
              )}

              {selectedWalletMode === 'private-seed' && (
                <div className="text-white mt-4">
                  <p>Your 55 character private key (seed):</p>
                  <input
                    type="text"
                    className="w-full p-4 mt-4 bg-gray-50 rounded-lg text-black"
                    value={privateSeed}
                    onChange={(e) => privateKeyValidate(e.target.value)}
                  />
                  {errorMsgPrivateSeed && <p className="text-red-500">{errorMsgPrivateSeed}</p>}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <button
                      className="bg-primary-40 p-4 rounded-lg text-black text-center"
                      onClick={() => setSelectedWalletMode('none')}
                    >
                      Cancel
                    </button>
                    <button
                      className="bg-primary-40 p-4 rounded-lg text-black text-center"
                      onClick={privateKeyConnect}
                      disabled={!!errorMsgPrivateSeed}
                    >
                      Unlock
                    </button>
                  </div>
                </div>
              )}

              {selectedWalletMode === 'vault-file' && (
                <div className="text-white mt-4">
                  <p>Load your Qubic vault file:</p>
                  <input
                    type="file"
                    className="w-full p-4 mt-4 bg-gray-50 rounded-lg"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                  />
                  <p>Enter vault password</p>
                  <input
                    type="password"
                    className="w-full p-4 mt-4 bg-gray-50 rounded-lg text-black"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <button
                      className="bg-primary-40 p-4 rounded-lg text-black text-center"
                      onClick={() => setSelectedWalletMode('none')}
                    >
                      Cancel
                    </button>
                    <button
                      className="bg-primary-40 p-4 rounded-lg text-black text-center"
                      onClick={vaultFileConnect}
                    >
                      Unlock
                    </button>
                  </div>
                </div>
              )}

              {selectedWalletMode === 'account-select' && (
                <div className="text-white mt-4">
                  <p>Select an account:</p>
                  <select
                    className="w-full p-4 mt-4 bg-gray-50 rounded-lg text-black"
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                  >
                    {accounts.map((account, idx) => (
                      <option key={account.publicId} value={idx}>
                        {`${account.alias} (${account.publicId})`}
                      </option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <button
                      className="bg-primary-40 p-4 rounded-lg text-black text-center"
                      onClick={() => setSelectedWalletMode('none')}
                    >
                      Cancel
                    </button>
                    <button
                      className="bg-primary-40 p-4 rounded-lg text-black text-center"
                      onClick={selectAccount}
                    >
                      Select Account
                    </button>
                  </div>
                </div>
              )}

              {selectedWalletMode === 'metamask' && (
                <div className="text-white mt-4">
                  <p>Connect via MetaMask Snap for Qubic</p>
                  <button
                    className="bg-primary-40 p-4 rounded-lg text-black w-full text-center"
                    onClick={connectMetamask}
                  >
                    Install/Use Qubic Snap
                  </button>
                  <button
                    className="bg-primary-40 p-4 mt-4 rounded-lg text-black w-full text-center"
                    onClick={() => setSelectedWalletMode('none')}
                  >
                    Cancel
                  </button>
                </div>
              )}

              {selectedWalletMode === 'walletconnect' && (
                <div className="text-white mt-4">
                  <p>Connect via Qubic Wallet (WalletConnect)</p>
                  {wcIsConnecting && (
                    <p className="text-sm text-gray-400">Generating WalletConnect session...</p>
                  )}
                  {!wcIsConnecting && (
                    <>
                      {wcQrCode ? (
                        <div className="w-full flex flex-col items-center">
                          <img src={wcQrCode} alt="WalletConnect QR" className="mx-auto mb-2"/>
                        </div>
                      ) : (
                        wcUri && <p className="break-all text-sm">URI: {wcUri}</p>
                      )}
                      {wcIsConnected ? (
                        <button
                          className="bg-primary-40 p-4 rounded-lg text-black w-full text-center"
                          onClick={connectWalletConnect}
                        >
                          Continue
                        </button>
                      ) : (
                        <p className="text-sm text-gray-400">
                          {wcUri ? '' : 'No new session. Possibly an existing session is active.'}
                        </p>
                      )}
                    </>
                  )}
                  <button
                    className="bg-primary-40 p-4 mt-4 rounded-lg text-black w-full text-center"
                    onClick={() => setSelectedWalletMode('none')}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Separator */}
            {(connected || (selectedWalletMode === 'none' && selectedServerMode === 'none')) && (
              <hr className="my-6 border-white"/>
            )}

            {/* Server Connection Section */}
            {(connected || selectedWalletMode === 'none') && (
              <div>
                <h3 className="text-white mb-6 text-center font-bold text-xl">Server Connection</h3>
                {connectedToCustomServer ? (
                  <div className="space-y-2">
                    <button
                      className="bg-primary-40 p-4 rounded-lg text-black w-full text-center"
                      onClick={handleServerDisconnect}
                    >
                      Disconnect from Server
                    </button>
                    <p className="text-sm text-gray-400">
                      Current httpendpoint: {httpEndpoint}
                    </p>
                    <p className="text-sm text-gray-400">
                      Current backend URL: {backendUrl}
                    </p>
                  </div>
                ) : (
                  <>
                    {selectedServerMode === 'none' && selectedWalletMode === 'none' && (
                      <button
                        className="bg-primary-40 p-4 rounded-lg text-black w-full text-center"
                        onClick={() => {
                          setSelectedWalletMode('none')
                          setSelectedServerMode('server-config')
                        }}
                      >
                        Connect to Server
                      </button>
                    )}
                    {selectedServerMode === 'server-config' && (
                      <div className="mt-4">
                        <label className="block mb-2 text-white">HTTP Endpoint:</label>
                        <input
                          type="text"
                          className="w-full p-4 bg-gray-50 rounded-lg text-black"
                          placeholder="Enter HTTP Endpoint"
                          value={httpEndpointInput}
                          onChange={(e) => setHttpEndpointInput(e.target.value)}
                        />
                        <label className="block mt-4 mb-2 text-white">Backend URL:</label>
                        <input
                          type="text"
                          className="w-full p-4 bg-gray-50 rounded-lg text-black"
                          placeholder="Enter Backend URL"
                          value={backendUrlInput}
                          onChange={(e) => setBackendUrlInput(e.target.value)}
                        />
                        {errorMsg && <p className="text-red-500 mt-2">{errorMsg}</p>}
                        <div className="grid grid-cols-2 gap-4 mt-6">
                          <button
                            className="bg-primary-40 p-4 rounded-lg text-black text-center"
                            onClick={() => setSelectedServerMode('none')}
                          >
                            Cancel
                          </button>
                          <button
                            className="bg-primary-40 p-4 rounded-lg text-black text-center"
                            onClick={handleServerConnect}
                          >
                            Connect
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  )
}

export default ConnectModal
