import lock from "../../../assets/lock.svg"
import unlocked from "../../../assets/unlocked.svg"
import ConnectModal from "./ConnectModal"
import {useQubicConnect} from "../../../contexts/QubicConnectContext"
import {useQuotteryContext} from '../../../contexts/QuotteryContext'
import {formatQubicAmount} from "../util"
import {MIN_BALANCE_THRESHOLD} from "../util/commons"

const ConnectLink = () => {
  const {connected, showConnectModal, toggleConnectModal} = useQubicConnect()
  const {balance, fetchBalance, walletPublicIdentity} = useQuotteryContext()

  const handleBalanceClick = (e) => {
    e.stopPropagation()
    if (walletPublicIdentity) {
      fetchBalance(walletPublicIdentity)
    }
  }

  const isNotEnoughFund = parseInt(balance) <= MIN_BALANCE_THRESHOLD

  return (<>
    <div className="absolute right-12 sm:right-12 flex gap-[10px] justify-center items-center cursor-pointer"
         onClick={() => toggleConnectModal()}
    >
      {connected ? <>
        <div className="hidden md:block flex flex-col items-center">
          <span
            className='hidden md:flex font-space items-center flex-row text-[16px] text-gray-50 mt-[5px] font-[500]'>
            <img src={lock} alt="locked lock icon" className="mr-2"/>
            <span>Lock Wallet</span>
          </span>
          {balance && (
            <div className={`hidden md:block text-white mt-2 text-[14px] cursor-pointer ${isNotEnoughFund ? 'text-red font-bold' : 'text-white'}`}
                 onClick={handleBalanceClick}
                 title={isNotEnoughFund ? "Please deposit funds into your account" : "Click to refresh balance"}
            >
              Balance: {formatQubicAmount(balance)} QUBIC
            </div>
          )}
        </div>

        <div className="md:hidden">
          <span className='hidden md:block font-space text-[16px] text-gray-50 mt-[5px] font-[500]'>
          Lock Wallet
        </span>
          <img src={lock} alt="locked lock icon" />
        </div>
      </> : <>
        <span className='hidden md:block font-space text-[16px] text-gray-50 mt-[5px] font-[500]'>
          Unlock Wallet
        </span>
        <img src={unlocked} alt="unlocked lock icon"/>
      </>}
    </div>
    <ConnectModal
      open={showConnectModal}
      onClose={() => toggleConnectModal()}
    />
  </>)
}

export default ConnectLink
