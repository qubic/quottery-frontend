/* global BigInt */

import React, { createContext, useContext, useEffect, useState } from 'react'
import { QubicHelper } from '@qubic-lib/qubic-ts-library/dist/qubicHelper'
import Crypto from '@qubic-lib/qubic-ts-library/dist/crypto'

const QubicConnectContext = createContext()
// TODO move to config
export const httpEndpoint = 'https://api.qubic.world' // test system
// export const httpEndpoint = 'https://rpc.qubic.org' // live system

export function QubicConnectProvider({ children }) {
  const [connected, setConnected] = useState(false)
  const [wallet, setWallet] = useState(null)
  const [showConnectModal, setShowConnectModal] = useState(false)

  const qHelper = new QubicHelper()

  useEffect(() => {
    const wallet = localStorage.getItem('wallet')
    if (wallet) {
      setWallet(wallet)
      setConnected(true)
    }
  }, [])

  const connect = (wallet) => {
    localStorage.setItem('wallet', wallet)
    setWallet(wallet)
    setConnected(true)
  }

  const disconnect = () => {
    localStorage.removeItem('wallet')
    setWallet(null)
    setConnected(false)
  }

  const toggleConnectModal = () => {
    setShowConnectModal(!showConnectModal)
  }

  function uint8ArrayToBase64(uint8Array) {
    const binaryString = String.fromCharCode.apply(null, uint8Array)
    return btoa(binaryString)
  }

  const signTx = async (bet) => {
    const idPackage = await qHelper.createIdPackage(wallet)
    console.log('id', idPackage)
    const qCrypto = await Crypto
    // console.log(qHelper.privateKey(wallet, 0, qCrypto.K12))
    const tick = await getTick()
    const tickOffset = 5
    console.log('tick:', tick + tickOffset)
    // build Quottery TX
    const quotteryTxSize = qHelper.TRANSACTION_SIZE + 16
    const sourcePrivateKey = idPackage.privateKey
    const sourcePublicKey = idPackage.publicKey
    const tx = new Uint8Array(quotteryTxSize).fill(0)
    const txView = new DataView(tx.buffer)
    const contractIndex = 2
    // fill all with zero
    for (let i = 0; i < quotteryTxSize; i++) {
      tx[i] = 0
    }
    // sourcePublicKey byte[] // 32
    let offset = 0
    let i = 0
    for (i = 0; i < qHelper.PUBLIC_KEY_LENGTH; i++) {
      tx[i] = sourcePublicKey[i]
    }
    offset = i
    tx[offset] = contractIndex // 2 for Quottery
    offset++
    for (i = 1; i < qHelper.PUBLIC_KEY_LENGTH; i++) {
      tx[offset + i] = 0
    }
    offset += i - 1
    txView.setBigInt64(offset, BigInt(bet.amountPerSlot * bet.numberOfSlots), true); // amount per slot
    offset += 8
    txView.setUint32(offset, tick + tickOffset, true)
    offset += 4
    txView.setUint16(offset, 2, true) // inputType for join bet is 2
    offset += 2;
    txView.setUint16(offset, 16, true); // inputSize for Quottery is 16
    offset += 2;
    //
    // add Quottery specific data
    //
    // bet_id
    txView.setUint32(offset, bet.betId, true)
    offset += 4
    // numberOfSlot
    txView.setUint32(offset, bet.numberOfSlots, true)
    offset += 4
    // bet option
    txView.setUint32(offset, bet.betOption, true)
    offset += 4
    // _placeholder
    txView.setUint32(offset, 0, true)
    offset += 4
    const digest = new Uint8Array(qHelper.DIGEST_LENGTH)
    const toSign = tx.slice(0, offset)
    qCrypto.K12(toSign, digest, qHelper.DIGEST_LENGTH)
    const signedtx = qCrypto.schnorrq.sign(sourcePrivateKey, sourcePublicKey, digest)
    tx.set(signedtx, offset)
    offset += qHelper.SIGNATURE_LENGTH

    console.log('bet:', bet)
    const txResult = await broadcastTx(tx)
    console.log('Response:', txResult)

    return {
      targetTick: tick + tickOffset,
      txResult
    }
  }

  const broadcastTx = async (tx) => {
    const url = `${httpEndpoint}/v1/broadcast-transaction`
    const txEncoded = uint8ArrayToBase64(tx)
    const body = {encodedTransaction: txEncoded}
    // console.log('body:', body)
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
      })
      // Check if the response status is OK (status code 200-299)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error:', error)
    }
  }

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

  return (
    <QubicConnectContext.Provider value={{
      connected, wallet, showConnectModal,
      connect, disconnect, toggleConnectModal,
      signTx, getTick, broadcastTx
    }}>
      {children}
    </QubicConnectContext.Provider>
  )
}

export function useQubicConnect() {
    const context =  useContext(QubicConnectContext)
    if (context === undefined) {
      throw new Error("useQubicConnect must be used within a QubicConnectProvider")
    }
    return context
}
