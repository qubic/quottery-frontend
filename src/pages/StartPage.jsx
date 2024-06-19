import React from 'react'
import { useNavigate } from 'react-router-dom'
import BetOverviewCard from '../components/BetOverviewCard'
import { mockData } from './mockData'

function StartPage() {
  const navigate = useNavigate()

  return (
    <div className='sm:px-30 md:px-130'>
      <div className='mt-40 text-center'>
        <span className='text-40 md:text-48 font-space text-white'>
          Bet on anything.<span className=' text-primary-40'> Anytime.</span>
        </span>
      </div>
      <div className='text-gray-50 mt-[24px] text-center font-space'>
        <span className='text-[18px]'>Quottery is p2p betting system</span>
      </div>
      <div className=' flex justify-center items-center mt-[32px] '>
        <button className='bg-[rgba(26,222,245,0.1)] py-[8px] px-[16px] text-[14px] text-primary-40 font-space rounded-[8px]'>Create Bet</button>
      </div>
      <div className='flex justify-between items-center mt-[48px] px-20'>
        <span className=' text-white font-space'>Active Bets</span>
        <span className=' text-primary-40 font-space cursor-pointer'>Filter Bets</span>
      </div>
      <div className='
        grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 
        justify-center items-center gap-[16px] 
        mt-[16px] mb-[100px]
        px-5 sm:px-20 md:px-100
      '>
        {mockData.map((betData, index) => {
          return (
            <BetOverviewCard 
              key={'bet' + index}
              data={betData}
              onClick={() => {
                navigate('/bet/' + betData.id)
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

export default StartPage
