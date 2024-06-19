import { useState } from "react"
import Card from "../Card"
import { useQubicConnect } from "./QubicConnectContext"

const ConnectModal = ({ open, onClose }) => {

    const [selectedMode, setSelectedMode] = useState('none')
    const [privateSeed, setPrivateSeed] = useState('')
    const { connect, disconnect, connected } = useQubicConnect()    

    const privateKeyConnect = () => {
        connect(privateSeed)
        // reset and close
        setSelectedMode('none')
        setPrivateSeed('')
        onClose()
    }

    const vaultFileConnect = () => {
        console.log('connect with vault file')
    }

    return (<>
        {open && <div 
            className="w-full p-5 h-full fixed top-0 left-0 overflow-x-hidden overflow-y-auto z-50 bg-smoke-light flex"
            onClick={() => {                
                setSelectedMode('none')
                onClose()
            }}
        >
            <Card className="relative p-8 w-full max-w-md m-auto flex-col flex" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <div className="text-2xl text-white">qubic <span className="text-primary-40">connect</span></div>
                    <button onClick={onClose} className="text-2xl text-white">X</button>
                </div>
                
                {selectedMode === 'none' && 
                    <div className="flex flex-col gap-4 mt-4">
                        {connected &&
                            <button 
                                className="bg-primary-40 p-4 mt-4 rounded-lg text-black"
                                onClick={() => disconnect()}>Lock Wallet</button>
                        }
                        {!connected && <>
                            <button 
                                className="bg-primary-40 p-4 rounded-lg"
                                onClick={() => setSelectedMode('private-seed')}>Private Seed</button>
                            <button 
                                className="bg-primary-40 p-4 rounded-lg"
                                onClick={() => setSelectedMode('vault-file')}>Vault File</button>
                            <button disabled 
                                className="bg-gray-50 p-4 rounded-lg"
                                onClick={() => setSelectedMode('metamask')}>Metamask (coming soon)</button>
                        </>}                        
                    </div>
                }
                
                {selectedMode === 'private-seed' && 
                    <div className="text-white mt-4">
                        Your 55 character private key (seed):
                        <input 
                            type="text" className="w-full p-4 mt-4 bg-gray-50 rounded-lg" 
                            value={privateSeed}
                            onChange={(e) => setPrivateSeed(e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <button 
                                className="bg-primary-40 p-4 mt-4 rounded-lg text-black"
                                onClick={() => setSelectedMode('none')}>Cancel</button>
                            <button 
                                className="bg-primary-40 p-4 mt-4 rounded-lg text-black"
                                onClick={() => privateKeyConnect()}>Connect</button>
                        </div>
                    </div>
                }

                {selectedMode === 'vault-file' && 
                    <div className="text-white mt-4">
                        Load your Qubic vault file:
                        <input type="file" className="w-full p-4 mt-4 bg-gray-50 rounded-lg" />
                        <input type="password" className="w-full p-4 mt-4 bg-gray-50 rounded-lg" placeholder="Enter password" />
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <button 
                                className="bg-primary-40 p-4 mt-4 rounded-lg text-black"
                                onClick={() => setSelectedMode('none')}>Cancel</button>
                            <button 
                                className="bg-primary-40 p-4 mt-4 rounded-lg text-black"
                                onClick={() => vaultFileConnect()}>Connect</button>
                        </div>
                    </div>
                }
            </Card>
        </div>}
    </>)
}

export default ConnectModal