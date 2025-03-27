/* global BigInt */
import React, {createContext, useContext, useEffect, useState} from 'react'
import {QubicHelper} from '@qubic-lib/qubic-ts-library/dist/qubicHelper'
import Crypto, {SIGNATURE_LENGTH} from '@qubic-lib/qubic-ts-library/dist/crypto'
import {QubicTransaction} from '@qubic-lib/qubic-ts-library/dist/qubic-types/QubicTransaction'
import {useConfig} from "./ConfigContext"
import {defaultSnapOrigin, MetaMaskProvider} from "./MetamaskContext"
import {useWalletConnectContext, WalletConnectProvider} from "./WalletConnectContext"
import {base64ToUint8Array, decodeUint8ArrayTx} from "../components/qubic/util/index"
import {toast} from "react-hot-toast"

const QubicConnectContext = createContext()

// Utility function to sign transactions locally
async function localSignTx(qHelper, privateKey, tx) {
  const qCrypto = await Crypto
  const idPackage = await qHelper.createIdPackage(privateKey)
  const digest = new Uint8Array(qHelper.DIGEST_LENGTH)
  const toSign = tx.slice(0, tx.length - SIGNATURE_LENGTH)

  qCrypto.K12(toSign, digest, qHelper.DIGEST_LENGTH)
  const signature = qCrypto.schnorrq.sign(idPackage.privateKey, idPackage.publicKey, digest)
  tx.set(signature, tx.length - SIGNATURE_LENGTH)
  return tx
}

export function QubicConnectProvider({children}) {
  const [connected, setConnected] = useState(false)
  const [wallet, setWallet] = useState(null)
  const [showConnectModal, setShowConnectModal] = useState(false)

  const qHelper = new QubicHelper()
  const {httpEndpoint} = useConfig()
  const wcCtx = useWalletConnectContext()

  // Load wallet from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('wallet')
    if (!saved) return
    try {
      const parsed = JSON.parse(saved)
      setWallet(parsed)
      setConnected(true)
    } catch (error) {
      // Handle legacy string storage (private key only)
      connect({
        connectType: "privateKey",
        privateKey: saved
      })
    }
  }, [])

  // Convert Uint8Array to base64
  function uint8ArrayToBase64(uint8Array) {
    const binaryString = String.fromCharCode.apply(null, uint8Array)
    return btoa(binaryString)
  }

  // Connect function updated to handle walletInfo object
  const connect = (walletInfo) => {
    localStorage.setItem('wallet', JSON.stringify(walletInfo))
    setWallet(walletInfo)
    setConnected(true)
  }

  // Disconnect and clear WalletConnect session
  const disconnect = () => {
    localStorage.removeItem('wallet')
    setWallet(null)
    setConnected(false)
    wcCtx.disconnect()
  }

  const toggleConnectModal = () => {
    setShowConnectModal(!showConnectModal)
  }

  // Broadcast transaction to the network
  const broadcastTx = async (tx) => {
    if (!httpEndpoint) {
      throw new Error('No httpEndpoint is set')
    }
    const url = `${httpEndpoint}/v1/broadcast-transaction`
    const txEncoded = uint8ArrayToBase64(tx)
    const body = {encodedTransaction: txEncoded}
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Fetch current tick from the network
  const getTick = async () => {
    const tickResult = await fetch(`${httpEndpoint}/v1/tick-info`)
    const tick = await tickResult.json()
    // check if tick is valid
    if (!tick || !tick.tickInfo || !tick.tickInfo.tick) {
      console.warn('getTick: Invalid tick')
      return 0
    }
    return tick.tickInfo.tick
  }

  const getSourcePublicKey = async () => {
    if (!wallet) throw new Error('No wallet connected')
    if (wallet.connectType === 'privateKey' || wallet.connectType === 'vaultFile') {
      const idPackage = await qHelper.createIdPackage(wallet.privateKey)
      return idPackage.publicKey
    } else if (wallet.connectType === 'mmSnap' || wallet.connectType === 'walletconnect') {
      return qHelper.getIdentityBytes(wallet.publicKey)
    } else {
      throw new Error(`Unsupported connectType: ${wallet.connectType}`)
    }
  }

  // General signTransaction function supporting multiple connection types
  const signTransaction = async (tx) => {
    if (!wallet || !wallet.connectType) {
      throw new Error("No wallet or connectType set.")
    }
    let processedTx = tx instanceof QubicTransaction ? await tx.build(wallet.privateKey ?? '0'.repeat(55)) : tx

    switch (wallet.connectType) {
      case "privateKey":
      case "vaultFile": {
        return await localSignTx(qHelper, wallet.privateKey, processedTx)
      }
      case "mmSnap": {
        const base64Tx = btoa(String.fromCharCode(...processedTx))
        const offset = processedTx.length - SIGNATURE_LENGTH
        const signedResult = await window.ethereum.request({
          method: "wallet_invokeSnap",
          params: {
            snapId: defaultSnapOrigin,
            request: {
              method: "signTransaction",
              params: {
                base64Tx,
                accountIdx: 0,
                offset,
              },
            },
          },
        })
        const binary = atob(signedResult.signedTx)
        const signature = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) {
          signature[i] = binary.charCodeAt(i)
        }
        processedTx.set(signature, offset)
        return processedTx
      }
      case "walletconnect": {
        toast("Sign the transaction in your wallet", {
          icon: "🔑",
        })
        const decodedTx = decodeUint8ArrayTx(processedTx)

        const amountBytes = decodedTx.amount.getNumber()
        const amountView = new DataView(amountBytes.buffer, amountBytes.byteOffset, amountBytes.byteLength)
        const amountValue = amountView.getBigUint64(0, true)
        let amountParam
        if (amountValue <= Number.MAX_SAFE_INTEGER) {
          amountParam = Number(amountValue)
        } else {
          amountParam = amountValue.toString()
        }
        const [from, to] = await Promise.all([
          qHelper.getIdentity(decodedTx.sourcePublicKey.getIdentity()),
          qHelper.getIdentity(decodedTx.destinationPublicKey.getIdentity())
        ])
        const payloadBase64 = decodedTx.payload ? uint8ArrayToBase64(decodedTx.payload.getPackageData()) : null

        const wcResult = await wcCtx.signTransaction({
          from,
          to,
          amount: amountParam,
          tick: decodedTx.tick,
          inputType: decodedTx.inputType,
          payload: payloadBase64 === "" ? null : payloadBase64
        })
        return base64ToUint8Array(wcResult.signedTransaction)
      }
      default:
        throw new Error(`Unsupported connectType: ${wallet.connectType}`)
    }
  }

  return (
    <QubicConnectContext.Provider
      value={{
        connected,
        wallet,
        showConnectModal,
        connect,
        disconnect,
        toggleConnectModal,
        signTransaction,
        getTick,
        broadcastTx,
        getSourcePublicKey,
      }}
    >
      {children}
    </QubicConnectContext.Provider>
  )
}

export function QubicConnectCombinedProvider({children}) {
  return (
    <MetaMaskProvider>
      <WalletConnectProvider>
        <QubicConnectProvider>{children}</QubicConnectProvider>
      </WalletConnectProvider>
    </MetaMaskProvider>
  )
}

export function useQubicConnect() {
  const context = useContext(QubicConnectContext)
  if (context === undefined) {
    throw new Error("useQubicConnect must be used within a QubicConnectProvider")
  }
  return context
}
