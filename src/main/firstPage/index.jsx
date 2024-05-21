import React from 'react'
import Cards from '../../components/Cards'
import { mockData } from './mockData'

function FirstPage() {

  return (
    <div className='px-[130px]'>
      <div className='mt-[72px] text-center'>
        <span className=' text-[48px] font-space text-white'>Bet on anything.<span className=' text-customBlue1'> Anytime.</span></span>
      </div>
      <div className='text-gray-50 mt-[24px] text-center font-space'>
        <span className=' text-[18px]'>Quottery is p2p betting system</span>
      </div>
      <div className=' flex justify-center items-center mt-[32px] '>
        <button className='bg-[rgba(26,222,245,0.1)] py-[8px] px-[16px] text-[14px] text-customBlue1 font-space rounded-[8px]'>Create Bet</button>
      </div>
      <div className=' flex justify-between items-center mt-[48px]'>
        <span className=' text-white font-space py-[10px] pr-[20px]'>Active bets</span>
        <span className=' text-customBlue1 font-space cursor-pointer py-[10px] pl-[20px]'>Filter Bets</span>
      </div>
      <div className=' mt-[16px] grid grid-cols-3 justify-center items-center gap-[16px] mb-[100px]'>
        {mockData.map((mocks, index) => {
          return (
            <Cards data={mocks} />
          )
        })}
      </div>
    </div>
  )
}

export default FirstPage