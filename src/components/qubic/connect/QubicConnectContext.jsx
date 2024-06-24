import React, { createContext, useContext, useEffect, useState } from 'react'

const QubicConnectContext = createContext()

export function QubicConnectProvider({ children }) {
  const [connected, setConnected] = useState(false)
  const [wallet, setWallet] = useState(null)
  const [showConnectModal, setShowConnectModal] = useState(false)

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

  return (
    <QubicConnectContext.Provider value={{ 
      connected, wallet, showConnectModal, 
      connect, disconnect, toggleConnectModal
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