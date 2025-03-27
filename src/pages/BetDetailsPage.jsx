import React, {useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {IoIosArrowDown} from "react-icons/io"
import {useQuotteryContext} from '../contexts/QuotteryContext'
import Card from '../components/qubic/Card'
import QubicCoin from "../assets/qubic-coin.svg"
import {formatQubicAmount, sumArray, truncateMiddle} from '../components/qubic/util'
import LabelData from '../components/LabelData'
import {useQubicConnect} from '../contexts/QubicConnectContext'
import ConfirmTxModal from '../components/qubic/connect/ConfirmTxModal'
import {fetchBetDetail} from '../components/api/betApi'
import {QubicHelper} from "@qubic-lib/qubic-ts-library/dist/qubicHelper";
import {excludedBetIds, externalJsonAssetUrl, formatDate} from '../components/qubic/util/commons'
import {useConfig} from "../contexts/ConfigContext"

/* global BigInt */

function BetDetailsPage() {
  const {id} = useParams()
  const [bet, setBet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showConfirmTxModal, setShowConfirmTxModal] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  const [amountOfBetSlots, setAmountOfBetSlots] = useState(0)
  const [optionCosts, setOptionCosts] = useState(0)
  const [detailsViewVisible, setDetailsViewVisible] = useState(false)
  const {connected, toggleConnectModal} = useQubicConnect()
  const {coreNodeBetIds, walletPublicIdentity, balance, fetchBalance, joinBet} = useQuotteryContext()
  const [isOracleProvider, setIsOracleProvider] = useState(false)
  const [isAfterEndDate, setIsAfterEndDate] = useState(false)
  const [hasEnoughParticipants, setHasEnoughParticipants] = useState(false)
  const [publishButtonText, setPublishButtonText] = useState('')
  const [hasEnoughBalance, setHasEnoughBalance] = useState(true)
  const {httpEndpoint, backendUrl} = useConfig()


  const navigate = useNavigate()

  const updateAmountOfBetSlots = (value) => {
    // check if value is not less than 1 and not greater than max_slot_per_option
    if (value < 1 || value > bet.maxBetSlotPerOption) return
    // valid value
    const costs = BigInt(value) * BigInt(bet.amount_per_bet_slot)
    setOptionCosts(costs)
    setAmountOfBetSlots(value)
    if (balance !== null) {
      setHasEnoughBalance(BigInt(balance) >= costs)
    }
  }

  const calcPercentage = (value, total) => (value / total) * 100
  const toggleDetailsView = () => setDetailsViewVisible(!detailsViewVisible)
  const incAmountOfBetSlots = () => updateAmountOfBetSlots(amountOfBetSlots + 1)
  const decAmountOfBetSlots = () => updateAmountOfBetSlots(amountOfBetSlots - 1)

  const BetOptionCosts = ({costs}) => {
    const [fontSize, setFontSize] = useState('text-[25px]')

    const costsStr = formatQubicAmount(costs)

    useEffect(() => {
      if (costsStr.length >= 14) {
        setFontSize('text-[15px]')
      } else if (costsStr.length >= 11) {
        setFontSize('text-[20px]')
      } else {
        setFontSize('text-[25px]') // Default font size
      }
    }, [costsStr])

    return (<>
      <span className={`${fontSize} text-primary-40 block`}>
        {costsStr}
      </span>
      <span className='text-[14px] text-gray-50 mt-[-5px]'>
        QUBIC
      </span>
    </>)
  }

  const calculateOptionPercentage = (b, idx) => {
    // check if b.current_num_selection is not all 0
    if (b.current_num_selection.every(num => num === 0)) return ''
    // valid value
    return `(
      ${b.current_num_selection[idx]} /
      ${calcPercentage(b.current_num_selection[idx], sumArray(b.current_num_selection)).toFixed(2)}
    %)`
  }

  const calculateBettingOdds = (currentNumSelection) => {
    const totalSelections = sumArray(currentNumSelection)
    let betting_odds = Array(currentNumSelection.length).fill("1.0")

    if (totalSelections > 0) {
      betting_odds = currentNumSelection.map(selection =>
        selection > 0 ? (totalSelections / selection).toFixed(2) : totalSelections.toFixed(2)
      )
    }

    return betting_odds
  }

  const updateBetDetails = async () => {
    try {
      setLoading(true)

      if (excludedBetIds.includes(parseInt(id))) {
        setBet(null)
        setLoading(false)
        navigate('/')
        return
      }

      const betId = parseInt(id)
      console.log(coreNodeBetIds)
      const updatedBet = await fetchBetDetail(httpEndpoint, backendUrl, betId, coreNodeBetIds)

      const isNewFormat = updatedBet.bet_desc.startsWith('###')

      if (isNewFormat) {
        const encodedHash = updatedBet.bet_desc.substring(3);
        const url = `${externalJsonAssetUrl}/bet_external_asset/${encodedHash}`;

        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          updatedBet.full_description = data.description;
        } catch (error) {
          console.error('Error fetching full description:', error);
          updatedBet.full_description = 'Description not available.';
        }
      } else {
        // Old format; use bet_desc as is
        updatedBet.full_description = updatedBet.bet_desc;
      }

      updatedBet.current_total_qus = sumArray(updatedBet.current_num_selection) * Number(updatedBet.amount_per_bet_slot)
      updatedBet.betting_odds = calculateBettingOdds(updatedBet.current_num_selection)

      const closeDate = new Date('20' + updatedBet.close_date + 'T' + updatedBet.close_time + 'Z');
      const now = new Date();
      updatedBet.is_active = now <= closeDate

      const endDateTime = new Date('20' + updatedBet.end_date + 'T' + updatedBet.end_time + 'Z')
      setIsAfterEndDate(now > endDateTime)

      const qHelper = new QubicHelper()
      if (updatedBet.creator instanceof Uint8Array) {
        updatedBet.creator = await qHelper.getIdentity(updatedBet.creator)
      }
      if (updatedBet.oracle_id[0] instanceof Uint8Array) {
        updatedBet.oracle_id = await Promise.all(
          updatedBet.oracle_id.map(async (op) => {
            return await qHelper.getIdentity(op)
          })
        )
      }

      const numOptionsJoined = updatedBet.current_num_selection.filter(num => num > 0).length
      setHasEnoughParticipants(numOptionsJoined >= 1)

      setBet(updatedBet)
    } catch (error) {
      console.error('Error updating bet details:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const checkConditions = async () => {
      if (bet && connected && walletPublicIdentity) {
        // Check if user is an Oracle Provider
        const oracleIndex = bet.oracle_id.findIndex(providerId => providerId === walletPublicIdentity)
        const isProvider = oracleIndex !== -1
        setIsOracleProvider(isProvider)

        if (!isProvider) {
          // Do not show the button at all
          setPublishButtonText('')
          return
        }

        // Check if the Oracle Provider has already published
        const betResultOPId = bet.betResultOPId || []

        // Get the indices of Oracles who have published
        const publishedOracleIndices = betResultOPId.filter(value => value !== -1)

        // Map these indices to the actual Oracle IDs
        const votedOracles = publishedOracleIndices.map(index => bet.oracle_id[index])

        // Check if the current wallet's public ID is in the list of Oracles who have published
        const hasPublished = votedOracles.includes(walletPublicIdentity)

        // Determine the button text and state based on conditions
        if (!isAfterEndDate) {
          // The date hasn't arrived yet. Tell the Oracle Provider "You Need to Calm Down"
          setPublishButtonText(`Publish bet after ${formatDate(bet.end_date)} ${bet.end_time} UTC)`);
        } else if (!hasEnoughParticipants) {
          // Not enough participants
          setPublishButtonText('Unable to publish bet (not enough parties joined the bet)')
        } else if (hasPublished) {
          // Already published
          setPublishButtonText('You have already published this bet')
        } else {
          // All conditions met, enable the button
          setPublishButtonText('Publish bet')
        }
      }
    }

    checkConditions()
  }, [bet, connected, isAfterEndDate, walletPublicIdentity, hasEnoughParticipants])

  useEffect(() => {

    updateBetDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, coreNodeBetIds])

  const handleTransactionComplete = async () => {
    if (walletPublicIdentity) {
      await fetchBalance(walletPublicIdentity)
    }
    // updateBetDetails()
  }

  useEffect(() => {
    if (balance !== null) {
      setHasEnoughBalance(BigInt(balance) >= BigInt(optionCosts))
    }
  }, [balance, optionCosts])

  const handleBetNowClick = async () => {
    if (connected) {
      if (walletPublicIdentity) {
        await fetchBalance(walletPublicIdentity)
      }
      if (!hasEnoughBalance) {
        alert(`You do not have enough balance to join this bet. Your balance: ${formatQubicAmount(balance)}, join bet fee: ${formatQubicAmount(optionCosts)}`)
        return
      }
      setShowConfirmTxModal(true)
    } else {
      toggleConnectModal()
    }
  }

  const handleCancel = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <div className='sm:px-30 md:px-130'>
      {loading && <div className='text-center mt-[105px] text-white'>Loading...</div>}

      {!loading && bet && bet.bet_id >= 0 && <>

        <div className='mt-[10px] px-5 sm:px-20 md:px-100'>
          <div className='p-5 bg-gray-70 mt-[105px] mb-9 rounded-[8px] text-center text-[35px] text-white'>
            {bet.full_description}
          </div>
          {isOracleProvider && publishButtonText && (
            <button
              className={`p-2 rounded-lg size-full justify-center ${
                publishButtonText === 'Publish bet' ? 'bg-primary-40 text-black' : 'bg-gray-50 text-gray-900 cursor-not-allowed'
              }`}
              onClick={() => {
                if (publishButtonText === 'Publish bet') {
                  navigate(`/publish/${bet.bet_id}`);
                }
              }}
              disabled={publishButtonText !== 'Publish bet'}
            >
              {publishButtonText}
            </button>
          )}
          <Card className='p-[24px] w-full'>
            <div className='flex flex-col items-start justify-start gap-4'>
              <div className='grid grid-cols-2 md-grid-cols-3 justify-between items-center w-full'>
                <LabelData lbl="Bet closes at"
                           value={`${formatDate(bet.close_date)} ${bet.close_time.slice(0, -3)} UTC`}
                           description="The date and time when the bet will no longer be joinable and will be moved to the Locked Bet section."
                />
                <LabelData lbl="Slots taken" value={sumArray(bet.current_num_selection)}/>
                <LabelData lbl="Fee %"
                           value={sumArray(bet.oracle_fee) + ' %'}
                           description={"Total fees for Oracle Providers"}
                />
                <LabelData lbl="Burning" value={'2 %'}/>
              </div>
              <div className=' flex flex-col justify-center items-center size-full'>
                <span className=' text-gray-50 text-[12px] leading-[16px]'>
                  In the pot
                </span>
                <div className=' gap-[12px] flex justify-center items-center'>
                  <img src={QubicCoin} alt='Icon of a Qubic coin'/>
                  <span className='text-white text-[18px] leading-[23px]'>
                    {formatQubicAmount(bet.current_total_qus)} QUBIC
                  </span>
                </div>
              </div>

              {detailsViewVisible && <div className='w-full'>
                <div className='grid md:grid-cols-3'>
                  <LabelData lbl='Open'
                             value={`${formatDate(bet.open_date)} ${bet.open_time} UTC`}
                             description="The date and time when the bet becomes available for joining."
                  />
                  <LabelData lbl='Close'
                             value={`${formatDate(bet.close_date)} ${bet.close_time} UTC`}
                             description="The date and time when the bet will no longer be joinable and will be moved to the Locked Bet section."
                  />
                  <LabelData lbl='End'
                             value={`${formatDate(bet.end_date)} ${bet.end_time} UTC`}
                             description="The date and time when the oracle providers can publish the results. After the results are published, payouts will be made to bettors."
                  />
                </div>
                <LabelData lbl='Creator' value={truncateMiddle(bet.creator, 40)}/>
                <LabelData lbl='Oracle Provider(s)' value={bet.oracle_id.map((id, index) => (
                  <span className='block' key={index}>{truncateMiddle(id, 40)}</span>
                ))}/>
              </div>}

              <button className='flex w-full items-center text-14 text-primary-40'
                      onClick={() => toggleDetailsView()}
              >
                <span className='flex-1'></span>
                <IoIosArrowDown className={'flex-none mr-1 ' + (detailsViewVisible ? 'transform rotate-180' : '')}/>
                <span className='flex-none'>Details</span>
              </button>
            </div>
          </Card>

          {/*
            Bet still open for betting, choose an option.
          */}
          {bet && bet.result === -1 && bet.is_active &&
            <Card className='p-[24px] w-full mt-[16px]'>
              <span className='font-space text-gray-50 text-[12px] leading-[16px] mb-3 block'>
                Decide for your bet
              </span>
              {bet.option_desc && bet.option_desc.map((option, index) => {
                return (
                  <div className='flex items-center gap-4' key={index}>
                    <button
                      key={index}
                      className={'py-[8px] px-[16px] mb-2 text-[14px] font-space rounded-[8px] w-full ' +
                        (selectedOption === index ? 'bg-success-40' : 'bg-primary-40')
                      }
                      onClick={() => setSelectedOption(index)}
                    >
                      {option} {calculateOptionPercentage(bet, index)}
                    </button>
                    <span className='text-white text-[16px] leading-[24px]'>
                      {Number(bet.betting_odds[index]).toFixed(2)}
                    </span>
                  </div>
                )
              })}
            </Card>
          }

          {/*
            We already have a result for this bet.
          */}
          {bet && bet.result !== -1 &&
            <Card className='p-[24px] w-full mt-[16px]'>
              <span className='font-space text-gray-50 text-[12px] leading-[16px] mb-3 block'>
                Bet Result
              </span>
              {bet.option_desc && bet.option_desc.map((option, index) => {
                return (
                  <div className='flex items-center gap-4 w-full' key={index}>
                    <span className={'py-[8px] px-[16px] mb-2 text-[14px] font-space rounded-lg w-full ' +
                      (bet.result === index ? 'bg-success-40' : 'bg-grey')}
                    >
                      {option} {calculateOptionPercentage(bet, index)}
                    </span>
                    <span className='text-white text-[16px] leading-[24px]'>
                      {Number(bet.betting_odds[index]).toFixed(2)}
                    </span>
                  </div>
                )
              })}
            </Card>
          }

          {/*
            We have no result for this bet.
          */}
          {bet && bet.result === -1 && !bet.is_active &&
            <Card className='p-[24px] w-full mt-[16px]'>
              <span className='font-space text-gray-50 text-[12px] text-center leading-[16px] block'>
                We have no result for this bet yet.
              </span>
            </Card>
          }

          {selectedOption === null && <div className='mb-40'></div>}
          {selectedOption !== null &&
            <Card className='p-[24px] w-full mt-[16px] mb-40'>
              <span className=' font-space text-gray-50 text-[12px] leading-[16px] block mb-3'>
                How many Bet Slots you want to buy?
              </span>
              <div className='grid'>
                <button
                  className='bg-[rgba(26,222,245,0.1)] text-primary-40 text-20 font-bold py-3'
                  onClick={incAmountOfBetSlots}
                >+
                </button>
                <input
                  className='py-3 text-[25px] text-center'
                  type='number'
                  value={amountOfBetSlots}
                  onChange={(e) => updateAmountOfBetSlots(parseInt(e.target.value))}
                />
                <button
                  className='bg-[rgba(26,222,245,0.1)] text-primary-40 text-20 font-bold py-3'
                  onClick={decAmountOfBetSlots}
                >-
                </button>
              </div>
              <span
                className='font-space text-gray-50 text-[12px] leading-[16px] block mt-3 text-right'
              >
                Price per slot: {formatQubicAmount(bet.amount_per_bet_slot)} QUBIC
              </span>
              <span
                className='font-space text-gray-50 text-[12px] leading-[16px] block mt-3 text-right underline cursor-pointer'
                onClick={() => updateAmountOfBetSlots(bet.maxBetSlotPerOption)}
              >
                Go for Max ({bet.maxBetSlotPerOption})
              </span>
            </Card>
          }
        </div>

        {/** Bet Now button */}
        <div className='
          fixed h-[88px] flex w-full z-5 bottom-0 gap-3
          border-t border-solid border-gray-70 bg-gray-90
        '>
          <button className='bg-[rgba(26,222,245,0.1)] flex-none py-[8px] px-[16px] text-18 text-primary-40 font-space'
                  onClick={handleCancel}
          >
            Cancel
          </button>
          <div className='flex-1 flex flex-col justify-center text-center'>
            <BetOptionCosts costs={optionCosts}/>
            {/*{!hasEnoughBalance && (*/}
            {/*  <p className="text-red-500 mt-2">*/}
            {/*    {`You do not have enough balance to proceed.`}*/}
            {/*  </p>*/}
            {/*)}*/}
          </div>
          <button
            className='flex-none bg-primary-40 py-[8px] px-10 text-18 disabled:bg-slate-50 disabled:text-gray-50'
            onClick={handleBetNowClick}
            disabled={optionCosts === 0}
          >
            {connected ? 'Bet!' : 'Bet!'}
          </button>

          <ConfirmTxModal
            open={showConfirmTxModal}
            onClose={() => {
              setShowConfirmTxModal(false)
              updateBetDetails() // Update bet details after closing the modal
            }}
            tx={{
              title: 'Bet Now',
              description: 'Are you sure you want to bet now?'
            }}
            onConfirm={async () => {
              return await joinBet({
                betId: bet.bet_id,
                betOption: selectedOption,
                numberOfSlots: amountOfBetSlots,
                amountPerSlot: bet.amount_per_bet_slot
              })
            }}
            onTransactionComplete={handleTransactionComplete}
          />
        </div>
      </>}
    </div>
  )
}

export default BetDetailsPage
