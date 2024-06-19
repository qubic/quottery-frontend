import { useState } from "react"
import lock from "../../../assets/lock.svg"
import unlocked from "../../../assets/unlocked.svg"
import ConnectModal from "./ConnectModal"
import { useQubicConnect } from "./QubicConnectContext"

const ConnectLink = () => {
    const [open, setOpen] = useState(false)
    const { connected } = useQubicConnect()    

    return (<>
        <div className="absolute right-12 sm:right-12 flex gap-[10px] justify-center items-center"
            onClick={() => setOpen(true)}
        >
            {connected ? <>
                <span className='hidden md:block font-space text-[16px] text-gray-50 mt-[5px] font-[500]'>
                    Lock Wallet
                </span>
                <img src={lock} alt="locked lock" className=' cursor-pointer' />
            </> : <>
                <span className='hidden md:block font-space text-[16px] text-gray-50 mt-[5px] font-[500]'>
                    Unlock Wallet
                </span>
                <img src={unlocked} alt="unlocked lock" className=' cursor-pointer' />
            </>
            }
        </div>
        <ConnectModal 
            open={open}
            onClose={() => setOpen(false)}
        />
    </>)
}

export default ConnectLink