import React, { createContext, useReducer, useEffect } from "react"

export const MetamaskActions = {
    SetInstalled: "SetInstalled",
    SetSnapsDetected: "SetSnapsDetected",
    SetIsFlask: "SetIsFlask",
    SetError: "SetError"
}

export const defaultSnapOrigin = "npm:@qubic-lib/qubic-mm-snap"

const initialState = {
    snapsDetected: false,
    isFlask: false,
    installedSnap: undefined,
    error: undefined
}

function reducer(state, action) {
    switch (action.type) {
        case MetamaskActions.SetInstalled:
            return {
                ...state,
                installedSnap: action.payload,
            }
        case MetamaskActions.SetSnapsDetected:
            return {
                ...state,
                snapsDetected: action.payload,
            }
        case MetamaskActions.SetIsFlask:
            return {
                ...state,
                isFlask: action.payload,
            }
        case MetamaskActions.SetError:
            return {
                ...state,
                error: action.payload,
            }
        default:
            return state
    }
}

async function detectSnaps() {
    if (typeof window === "undefined") return false
    try {
        const snaps = await getSnaps()
        return !!snaps
    } catch (err) {
        console.warn("[detectSnaps] Error or no snaps found:", err)
        return false
    }
}

async function getSnaps(provider) {
    const target = provider || window.ethereum
    if (!target) return undefined

    try {
        const snaps = await target.request({
            method: "wallet_getSnaps"
        })
        return snaps
    } catch (error) {
        console.error("[getSnaps] Error:", error)
        return undefined
    }
}

async function getSnap(version) {
    if (!window.ethereum) return undefined

    try {
        const snaps = await getSnaps()
        if (!snaps) return undefined

        return Object.values(snaps).find(snap => {
            return snap.id === defaultSnapOrigin && (!version || snap.version === version)
        })
    } catch (error) {
        console.error("[getSnap] Error:", error)
        return undefined
    }
}

export async function isFlask() {
    const provider = window.ethereum
    if (!provider) return false

    try {
        const clientVersion = await provider.request({
            method: "web3_clientVersion"
        })

        console.log("client version", clientVersion)

        let isFlaskDetected = false

        if (Array.isArray(clientVersion)) {
            isFlaskDetected = clientVersion.includes("flask")
        }
        else if (typeof clientVersion === "string") {
            isFlaskDetected = clientVersion.toLowerCase().includes("flask")
        }

        console.log("is flask detected", isFlaskDetected)
        return Boolean(provider && isFlaskDetected)
    } catch (err) {
        console.error("[isFlask] Error:", err)
        return false
    }
}

async function connectSnap(snapId = defaultSnapOrigin, params = {}) {
    if (!window.ethereum) throw new Error("MetaMask not found in the browser")

    return await window.ethereum.request({
        method: "wallet_requestSnaps",
        params: {
            [snapId]: params
        }
    })
}

export const MetaMaskContext = createContext()

export function MetaMaskProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState)

    useEffect(() => {
        async function init() {
            try {
                const snapsAvailable = await detectSnaps()
                dispatch({
                    type: MetamaskActions.SetSnapsDetected,
                    payload: snapsAvailable
                })
            } catch (error) {
                console.error("[MetaMaskProvider] detectSnaps error:", error)
            }
        }
        init()
    }, [])

    useEffect(() => {
        if (!state.snapsDetected) return

        async function checkSnapInstall() {
            try {
                const flask = await isFlask()
                dispatch({
                    type: MetamaskActions.SetIsFlask,
                    payload: flask
                })

                const installedSnap = await getSnap()
                dispatch({
                    type: MetamaskActions.SetInstalled,
                    payload: installedSnap
                })
            } catch (error) {
                console.error("[MetaMaskProvider] checkSnapInstall error:", error)
                dispatch({
                    type: MetamaskActions.SetError,
                    payload: error
                })
            }
        }
        checkSnapInstall()
    }, [state.snapsDetected])

    useEffect(() => {
        if (!state.error) return
        const timer = setTimeout(() => {
            dispatch({ type: MetamaskActions.SetError, payload: undefined })
        }, 10000)
        return () => clearTimeout(timer)
    }, [state.error])

    const contextValue = [
        state,
        dispatch,
        {
            connectSnap,
            getSnap,
            getSnaps
        }
    ]

    return (
        <MetaMaskContext.Provider value={contextValue}>
            {children}
        </MetaMaskContext.Provider>
    )
}