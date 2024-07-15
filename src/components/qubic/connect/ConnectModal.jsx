import { useState } from 'react'
import { QubicVault } from '@qubic-lib/qubic-ts-vault-library'
import Card from '../Card'
import { useQubicConnect } from './QubicConnectContext'
import QubicConnectLogo from '../../../assets/qubic-connect.svg'
import CloseIcon from '../../../assets/close.svg'

const ConnectModal = ({ open, onClose }) => {

    const [selectedMode, setSelectedMode] = useState('none')
    // Private seed handling
    const [privateSeed, setPrivateSeed] = useState('')
    const [errorMsgPrivateSeed, setErrorMsgPrivateSeed] = useState('')
    // Vault file handling
    const [vault] = useState(new QubicVault())
    const [selectedFile, setSelectedFile] = useState(null)
    const [password, setPassword] = useState('')
    // General connect/disconnect
    const { connect, disconnect, connected } = useQubicConnect()
    // account selection
    const [accounts, setAccounts] = useState([])
    const [selectedAccount, setSelectedAccount] = useState(0)

    const privateKeyConnect = () => {
        connect(privateSeed)
        // reset and close
        setSelectedMode('none')
        setPrivateSeed('')
        onClose()
    }

    // check if input is valid seed (55 chars and only lowercase letters)
    const privateKeyValidate = (pk) => {
        if (pk.length !== 55) {
            setErrorMsgPrivateSeed('Seed must be 55 characters long')
        }
        if (pk.match(/[^a-z]/)) {
            setErrorMsgPrivateSeed('Seed must contain only lowercase letters')
        }
        if (pk.length === 55 && !pk.match(/[^a-z]/)) {
            setErrorMsgPrivateSeed('')
        }
        setPrivateSeed(pk)
    }

    const vaultFileConnect = async () => {
        if (!selectedFile || !password) {
            alert('Please select a file and enter a password.')
            return
        }

        const fileReader = new FileReader()

        fileReader.onload = async (event) => {
            try {
                await vault.importAndUnlock(
                    true, // selectedFileIsVaultFile: boolean,
                    password,
                    null, // selectedConfigFile: File | null = null,
                    selectedFile, // File | null = null,
                    true, // unlock: boolean = false
                )
                // now we switch view to select one of the seeds
                setAccounts(vault.getSeeds())
                setSelectedMode('account-select')
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

    const selectAccount = () => {
        // get the first account of the vault
        const pkSeed = vault.revealSeed(
            accounts[parseInt(selectedAccount)].publicId
        )
        connect(pkSeed)
        onClose() // reset and close
    }

    const handleFileChange = event => setSelectedFile(event.target.files[0])
    const handlePasswordChange = event => setPassword(event.target.value)

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
                  <img src={QubicConnectLogo} alt="Qubic Connect Logo" className="h-6" />
                  <img src={CloseIcon} onClick={onClose} alt="Close Modal Icon" className="w-5 h-5 cursor-pointer" />
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
                                onClick={() => setSelectedMode('metamask')}>MetaMask (coming soon)</button>
                        </>}
                    </div>
                }

                {selectedMode === 'private-seed' &&
                    <div className="text-white mt-4">
                        Your 55 character private key (seed):
                        <input
                            type="text" className="w-full p-4 mt-4 bg-gray-50 rounded-lg"
                            value={privateSeed}
                            onChange={(e) => privateKeyValidate(e.target.value)}
                        />
                        {errorMsgPrivateSeed && <p className="text-red-500">{errorMsgPrivateSeed}</p>}
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <button
                                className="bg-primary-40 p-4 mt-4 rounded-lg text-black"
                                onClick={() => setSelectedMode('none')}>Cancel</button>
                            <button
                                className="bg-primary-40 p-4 mt-4 rounded-lg text-black"
                                onClick={() => privateKeyConnect()}>Unlock</button>
                        </div>
                    </div>
                }

                {selectedMode === 'vault-file' &&
                    <div className="text-white mt-4">
                        Load your Qubic vault file:
                        <input type="file" className="w-full p-4 mt-4 bg-gray-50 rounded-lg"
                            onChange={handleFileChange}
                        />
                        <input type="password" className="w-full p-4 mt-4 bg-gray-50 rounded-lg" placeholder="Enter password"
                            onChange={handlePasswordChange}
                        />
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <button
                                className="bg-primary-40 p-4 mt-4 rounded-lg text-black"
                                onClick={() => setSelectedMode('none')}>Cancel</button>
                            <button
                                className="bg-primary-40 p-4 mt-4 rounded-lg text-black"
                                onClick={() => vaultFileConnect()}>Unlock</button>
                        </div>
                    </div>
                }

                {selectedMode === 'account-select' &&
                    <div className="text-white mt-4">
                        Select an account:
                        <select className="w-full p-4 mt-4 bg-gray-50 rounded-lg"
                            value={selectedAccount}
                            onChange={(e) => setSelectedAccount(e.target.value)}
                        >
                            {accounts.map((account, idx) =>
                                <option key={account.publicId} value={idx}>{account.alias}</option>
                            )}
                        </select>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <button
                                className="bg-primary-40 p-4 mt-4 rounded-lg text-black"
                                onClick={() => {
                                    disconnect()
                                    setSelectedMode('none')
                                }}>Lock Wallet</button>
                            <button
                                className="bg-primary-40 p-4 mt-4 rounded-lg text-black"
                                onClick={() => selectAccount()}>Select Account</button>
                        </div>
                    </div>
                }
            </Card>
        </div>}
    </>)
}

export default ConnectModal
