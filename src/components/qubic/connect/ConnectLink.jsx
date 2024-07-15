import lock from "../../../assets/lock.svg"
import unlocked from "../../../assets/unlocked.svg"
import ConnectModal from "./ConnectModal"
import { useQubicConnect } from "./QubicConnectContext"

const ConnectLink = () => {
  const { connected, showConnectModal, toggleConnectModal } = useQubicConnect()

  return (<>
    <div className="absolute right-12 sm:right-12 flex gap-[10px] justify-center items-center cursor-pointer"
      onClick={() => toggleConnectModal()}
    >
      {connected ? <>
        <span className='hidden md:block font-space text-[16px] text-gray-50 mt-[5px] font-[500]'>
          Lock Wallet
        </span>
        <img src={lock} alt="locked lock icon" />
      </> : <>
        <span className='hidden md:block font-space text-[16px] text-gray-50 mt-[5px] font-[500]'>
          Unlock Wallet
        </span>
        <img src={unlocked} alt="unlocked lock icon" />
      </>
      }
    </div>
    <ConnectModal
      open={showConnectModal}
      onClose={() => toggleConnectModal()}
    />
  </>)
}

export default ConnectLink
