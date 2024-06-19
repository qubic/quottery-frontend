import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoIosArrowDown } from "react-icons/io"
import clsx from 'clsx'
import { mockData } from './mockData'
import Card from '../components/qubic/Card'
import QubicCoin from "../assets/qubic-coin.svg"
import { formatQubicAmount } from '../components/qubic/util'

function BetDetailsPage() {

  const [bet, setBet] = useState({})
  const [selectedOption, setSelectedOption] = useState(null)
  const [amountOfBetSlots, setAmountOfBetSlots] = useState(1)
  const [optionCosts, setOptionCosts] = useState(0)
  const [detailsViewVisible, setDetailsViewVisible] = useState(false)

  const navigate = useNavigate()

  const getBetDetails = () => {
    const betId = window.location.pathname.split('/').pop()
    const bet = mockData.find(bet => bet.id === parseInt(betId))
    setOptionCosts(bet.pricePerSlot * amountOfBetSlots)
    setBet(bet)
  }

  useEffect(() => {
    getBetDetails()
  }, [])

  const updateAmountOfBetSlots = (value) => {
    // check if value is not less than 1 and not greater than maxSlotsPerOption
    if (value < 1 || value > bet.maxSlotsPerOption) return
    // valid value
    setOptionCosts(value * bet.pricePerSlot)
    setAmountOfBetSlots(value)
  }

  const toggleDetailsView = () => setDetailsViewVisible(!detailsViewVisible)
  const incAmountOfBetSlots = () => updateAmountOfBetSlots(amountOfBetSlots + 1)
  const decAmountOfBetSlots = () => updateAmountOfBetSlots(amountOfBetSlots - 1)

  return (
    <div className='sm:px-30 md:px-130'>
      {(bet && !bet.id) && <div className='text-center mt-[105px] text-white'>Loading...</div>}
      
      {bet && bet.id && <>
        
        <div className='mt-[10px] px-5 sm:px-20 md:px-100'>
        <div className='p-5 bg-gray-70 mt-[105px] mb-9 rounded-[8px] text-center text-[35px] font-space text-white'>
          {bet.title}
        </div>
          <Card className='p-[24px] w-full'>
            <div className='flex flex-col items-start justify-start gap-4'>
              <div className=' flex justify-between items-center w-full'>
                <div className=' flex flex-col justify-center items-center'>
                  <span className=' font-space text-gray-50 text-[12px] leading-[16px]'>
                    Expires in
                  </span>
                  <span className=' font-space text-white text-[16px] leading-[24px]'>
                    {bet.expireDay}
                  </span>
                </div>
                <div className=' flex flex-col justify-center items-start'>
                  <span className=' font-space text-gray-50 text-[12px] leading-[16px]'>
                    Slots taken
                  </span>
                  <span className=' font-space text-white text-[16px] leading-[24px]'>
                    {bet.slotsLeft}
                  </span>
                </div>
                <div className=' flex flex-col justify-center items-center'>
                  <span className=' font-space text-gray-50 text-[12px] leading-[16px]'>
                    Fee
                  </span>
                  <span className=' font-space text-white text-[16px] leading-[24px]'>
                    {bet.fee}
                  </span>
                </div>
              </div>
              <div>
                <span className=' font-space text-gray-50 text-[12px] leading-[16px]'>
                  In the pot
                </span>
                <div className=' gap-[12px] flex justify-center items-center'>
                  <img src={QubicCoin} alt='' />
                  <span className='font-space text-white text-[18px] leading-[23px]'>
                    {formatQubicAmount(bet.amount)} QUBIC
                  </span>
                </div>
              </div>

              {detailsViewVisible && <div className='w-full'>
                <div className='flex flex-col'>
                  <span className='text-gray-50 text-12'>Open</span>
                  <span className='text-white text-16'>
                    {bet.openDate}
                  </span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-gray-50 text-12'>Close</span>
                  <span className='text-white text-16'>
                    {bet.closeDate}
                  </span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-gray-50 text-12'>End</span>
                  <span className='text-white text-16'>
                    {bet.endDate}
                  </span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-gray-50 text-12'>Creator</span>
                  <span className='text-white text-16'>
                    {bet.creator}
                  </span>
                </div>
                <div className='flex flex-col'>
                  <span className='text-gray-50 text-12'>Oracle Provider</span>
                  <span className='text-white text-16'>
                    {bet.oracleProvider}
                  </span>
                </div>
              </div>}

              <button className='flex w-full items-center text-14 text-primary-40'
                onClick={() => toggleDetailsView()}
              >
                <span className='flex-1'></span>
                <IoIosArrowDown className={
                  clsx('flex-none mr-1', detailsViewVisible && 'transform rotate-180')
                } />
                <span className='flex-none'>Details</span>
              </button>
            </div>
          </Card>
          <Card className='p-[24px] w-full mt-[16px]'>
            <span className='font-space text-gray-50 text-[12px] leading-[16px] mb-3 block'>
              Decide for your bet
            </span>
            {bet && bet.options && bet.options.map((option, index) => {
              return (
                <button 
                  key={index}
                  className={clsx(
                    'py-[8px] px-[16px] mb-2 text-[14px] font-space rounded-[8px] w-full bg-primary-40', 
                    selectedOption === option.id && 'bg-success-40'
                  )}
                  onClick={() => setSelectedOption(option.id)}
                >
                  {option.title}
                </button>
              )
            })}
          </Card>
          {selectedOption === null && <div className='mb-40'></div>}
          {selectedOption && 
            <Card className='p-[24px] w-full mt-[16px] mb-40'>
              {selectedOption && <>              
                <span className=' font-space text-gray-50 text-[12px] leading-[16px] block mb-3'>
                  How many Bet Slots you want to buy?
                </span>
                <div className='flex'>
                  <button 
                    className='flex-1 bg-[rgba(26,222,245,0.1)] text-primary-40 font-space font-bold'
                    onClick={decAmountOfBetSlots}
                  >-</button>
                  <input 
                    className='flex-1 py-3 text-[25px] text-center'
                    type='number'
                    value={amountOfBetSlots}
                    onChange={(e) => updateAmountOfBetSlots(e.target.value)}
                  />
                  <button 
                    className='flex-1 bg-[rgba(26,222,245,0.1)] text-primary-40 font-space font-bold'
                    onClick={incAmountOfBetSlots}
                  >+</button>
                </div>
                <span
                  className='font-space text-gray-50 text-[12px] leading-[16px] block mt-3 text-right'
                >
                  Price per slot: {formatQubicAmount(bet.pricePerSlot)} QUBIC
                </span>
                <span
                  className='font-space text-gray-50 text-[12px] leading-[16px] block mt-3 text-right underline cursor-pointer'
                  onClick={() => updateAmountOfBetSlots(bet.maxSlotsPerOption)}
                >
                  Go for Max ({bet.maxSlotsPerOption})
                </span>
              </>}              
            </Card>
          }
        </div>

        {/** Bet Now button */}
        <div className='
          fixed h-[78px] flex w-full z-20 bottom-0 gap-6 
          border-t border-solid border-gray-70 bg-gray-90
        '>  
          <button className='bg-[rgba(26,222,245,0.1)] flex-none py-[8px] px-[16px] text-[14px] text-primary-40 font-space'
            onClick={() => navigate('/')}
          >
            Cancel
          </button>      
          <div className='flex-1 text-center'>
            <span className='text-[25px] text-primary-40 block mt-3'>
              {formatQubicAmount(optionCosts)}
            </span>
            <span className='text-[14px] text-gray-50 block mt-[-5px]'>
              QUBIC
            </span>
          </div>
          {optionCosts > 0 && <>
            <button className='flex-none bg-primary-40 py-[8px] px-10 text-18 font-bold'>
              Bet Now
            </button>
          </>}
        </div>
      </>}
    </div>
  )
}

export default BetDetailsPage
