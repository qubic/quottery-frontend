import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BetOverviewCard from '../components/BetOverviewCard'
// import { mockData } from './mockData'
import Dropdown from '../components/qubic/Dropdown'

function StartPage() {
  const navigate = useNavigate()
  const [bets, setBets] = useState([])
  const [loading, setLoading] = useState(true)
  const [listFilter, setListFilter] = useState('all') // or e.g. {key: 'isActive', val: true}
  const [currentFilterOption, setCurrentFilterOption] = useState(0)
  const filterOptions = [
    {label: 'All', value: 'all'},
    {label: 'Active', value: {key: 'isActive', val: true}},
    {label: 'Inactive', value: {key: 'isActive', val: false}}
  ]
  const backendUrl = 'http://65.21.185.4:5000/get_active_bets'

  const parseDate = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number)
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      throw new Error('Invalid date format')
    }
    return new Date(year + 2000, month - 1, day)
  }

  const fetchBets = async () => {
    setLoading(true)
    
    const response = await fetch(backendUrl)
    const data = await response.json()
    
    // check if data contains bet_list
    if (data.bet_list) {      
      data.bet_list.forEach(bet => {
        // let's parse oracle_fee and oracle_id using JSON.parse
        bet.oracle_fee = JSON.parse(bet.oracle_fee)
        bet.oracle_id = JSON.parse(bet.oracle_id)
        // add an expires_in field to each bet based on open_date and close_date
        const closeDate = parseDate(bet.close_date)
        const now = new Date()
        const diff = closeDate - now
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        bet.expires_in = days
        // add as isActive field to each bet
        bet.isActive = now < closeDate
      })
      console.log(data.bet_list)
      setBets(data.bet_list)
      setLoading(false)
      return
    }
  }

  const filterBets = (bets) => {
    if (listFilter === 'all') {
      return bets
    } else if (typeof listFilter === 'object' && listFilter !== null) {
      return bets.filter(bet => bet[listFilter.key] === listFilter.val)
    }
    return bets
  }

  useEffect(() => {
    fetchBets()
  }, [])

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
        <span className=' text-white font-space'>{filterOptions[currentFilterOption].label} Bets</span>
        <Dropdown
          label={'Filter Bets'}
          options={filterOptions}
          selected={currentFilterOption} 
          setSelected={(idx) => {
            setCurrentFilterOption(idx)
            setListFilter(filterOptions[idx].value)
          }}
        />
      </div>
      <div className='
        grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 
        justify-center items-center gap-[16px] 
        mt-[16px] mb-[100px]
        px-5 sm:px-20 md:px-100
      '>
        {loading && <div>Loading...</div>}
        
        {!loading && bets && bets.length > 0 && <>
          {filterBets(bets).map((bet, index) => 
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
