import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BetOverviewCard from '../components/BetOverviewCard'
import Dropdown from '../components/qubic/Dropdown'
import { useQuotteryContext } from '../contexts/QuotteryContext'

function StartPage() {
  const navigate = useNavigate()
  const { state, loading, setBetsFilter } = useQuotteryContext()
  const [currentFilterOption, setCurrentFilterOption] = useState(1) // 0 = All, 1 = Active, 2 = Locked, 3 = Inactive
  const filterOptions = [
    {label: 'All', value: 'all'},
    {label: 'Active', value: 'active'},
    {label: 'Locked', value: 'locked'},
    {label: 'Inactive', value: 'inactive'},
  ]

  return (
    <div className='sm:px-30 md:px-130'>
      <div className='mt-40 text-center'>
        <span className='text-40 md:text-48 font-space text-white'>
          Bet on anything.<span className=' text-primary-40'> Anytime.</span>
        </span>
      </div>
      <div className='text-gray-50 mt-[24px] text-center font-space'>
        <span className='text-[18px]'>Join the ultimate P2P betting revolution. Safe, Secure and Exciting.</span>
      </div>
      <div className=' flex justify-center items-center mt-[32px] '>
        <button
          className='bg-[rgba(26,222,245,0.1)] py-[8px] px-[16px] text-[14px] text-primary-40 font-space rounded-[8px]'
          onClick={() => navigate('/create')}
        >
          Create Bet
        </button>
      </div>
      <div className='flex justify-between items-center mt-[48px] px-20'>
        <span className=' text-white font-space'>{filterOptions[currentFilterOption].label} Bets {state.bets ? `(${state.bets.length})` : null}</span>
        <Dropdown
          label={'Filter Bets'}
          options={filterOptions}
          selected={currentFilterOption}
          setSelected={(idx) => {
            setCurrentFilterOption(idx)
            setBetsFilter(filterOptions[idx].value)
          }}
        />
      </div>
      <div className='
        grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3
        justify-center items-center gap-[16px]
        mt-[16px] mb-[100px]
        px-5 sm:px-20
      '>
        {loading && <div>Loading...</div>}

        {!loading && state.bets && state.bets.length > 0 && <>
          {state.bets.map((bet, index) =>
            <BetOverviewCard
              key={'bet' + index}
              data={bet}
              onClick={() => navigate('/bet/' + bet.bet_id)}
            />)
          }
        </>}
      </div>
    </div>
  )
}

export default StartPage
