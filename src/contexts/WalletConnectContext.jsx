import React, {createContext, useContext, useEffect, useState} from "react"
import SignClient from "@walletconnect/sign-client"
import { toast } from "react-hot-toast"

const WalletConnectContext = createContext(null)

export function WalletConnectProvider({children}) {
    const [signClient, setSignClient] = useState(null)
    const [sessionTopic, setSessionTopic] = useState("")
    const [isConnecting, setIsConnecting] = useState(false)
    const [isConnected, setIsConnected] = useState(false)

    const WC_PROJECT_ID = "18d5b105234d703b451dd010510c9e12"
    const QUBIC_CHAIN_ID = "qubic:mainnet"

    // Initialize the client
    useEffect(() => {
        const init = async () => {
            try {
                const client = await SignClient.init({
                    projectId: WC_PROJECT_ID,
                    metadata: {
                        name: "Qubic Quottery",
                        description: "Qubic Quottery - Bet on anything. Anytime.",
                        url: "https://quottery.org",
                        icons: ["https://walletconnect.com/walletconnect-logo.png"],
                    },
                })
                setSignClient(client)

                // Check if we have a previously saved session
                const storedTopic = localStorage.getItem("wcSessionTopic")
                if (storedTopic) {
                    const existingSession = client.session.get(storedTopic)
                    if (existingSession) {
                        setSessionTopic(storedTopic)
                        setIsConnected(true)
                    } else {
                        localStorage.removeItem("wcSessionTopic")
                    }
                }

                // Handle session delete
                client.on("session_delete", () => {
                    setSessionTopic("")
                    setIsConnected(false)
                    localStorage.removeItem("wcSessionTopic")
                })
                // Handle session expire
                client.on("session_expire", () => {
                    setSessionTopic("")
                    setIsConnected(false)
                    localStorage.removeItem("wcSessionTopic")
                })
            } catch (err) {
                console.error("Error initializing WalletConnect:", err)
            }
        }
        init()
    }, [])

    /**
     * Start the WalletConnect pairing flow.
     */
    const connect = async () => {
        if (!signClient) return {
            uri: "", approve: async () => {
            }
        }

        setIsConnecting(true)
        try {
            const {uri, approval} = await signClient.connect({
                requiredNamespaces: {
                    qubic: {
                        chains: [QUBIC_CHAIN_ID],
                        methods: [
                            "qubic_requestAccounts",
                            "qubic_sendQubic",
                            "qubic_signTransaction",
                            "qubic_sign",
                        ],
                        events: ["accountsChanged", "amountChanged"],
                    },
                },
            })

            const approve = async () => {
                try {
                    const session = await approval()
                    setSessionTopic(session.topic)
                    setIsConnected(true)
                    localStorage.setItem("wcSessionTopic", session.topic)
                } catch (e) {
                    console.error("WC Connection rejected:", e)
                }
            }

            return {uri: uri || "", approval: approve}
        } catch (error) {
            console.error("Failed to connect WalletConnect:", error)
            return {
                uri: "", approval: async () => {
                }
            }
        } finally {
            setIsConnecting(false)
        }
    }

    const disconnect = async () => {
        if (!signClient || !sessionTopic) return
        try {
            await signClient.disconnect({
                topic: sessionTopic,
                reason: {code: 6000, message: "User disconnected"},
            })
            setSessionTopic("")
            setIsConnected(false)
            localStorage.removeItem("wcSessionTopic")
        } catch (error) {
            console.error("Failed to disconnect from WC:", error)
        }
    }

    const requestAccounts = async () => {
        if (!signClient || !sessionTopic) throw new Error("Not connected")
        try {
            return await signClient.request({
                topic: sessionTopic,
                chainId: QUBIC_CHAIN_ID,
                request: {
                    method: "qubic_requestAccounts",
                    params: {nonce: Date.now().toString()},
                },
            }) // array of { address: string, alias?: string, ... }
        } catch (error) {
            console.error("Failed to request accounts from Qubic wallet:", error)
            throw error
        }
    }

    const signTransaction = async ({
                                       from,
                                       to,
                                       amount,
                                       inputType,
                                       payload,
                                   }) => {
        if (!signClient || !sessionTopic) throw new Error("Not connected")
        try {
            return await signClient.request({
                topic: sessionTopic,
                chainId: QUBIC_CHAIN_ID,
                request: {
                    method: "qubic_signTransaction",
                    params: {
                        from,
                        to,
                        amount,
                        inputType,
                        payload,
                        nonce: Date.now().toString(),
                    },
                },
            })
        } catch (err) {
            toast.error(err?.message || "Failed to sign transaction")
            throw err
        }
    }

    return (
        <WalletConnectContext.Provider
            value={{
                signClient,
                sessionTopic,
                isConnecting,
                isConnected,
                connect,
                disconnect,
                requestAccounts,
                signTransaction,
            }}
        >
            {children}
        </WalletConnectContext.Provider>
    )
}

export function useWalletConnectContext() {
    const ctx = useContext(WalletConnectContext)
    if (!ctx) {
        throw new Error("useWalletConnectContext must be used within WalletConnectProvider")
    }
    return ctx
}
