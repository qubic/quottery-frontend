import React, { createContext, useReducer, useContext, useEffect, useState } from 'react'

const BetContext = createContext()

const betReducer = (state, action) => {
  switch (action.type) {
    case 'SET_BETS':
      return { 
        ...state, 
        bets: action.payload 
      }
    default:
      return state
  }
}

export const BetProvider = ({ children }) => {
  const [state, dispatch] = useReducer(betReducer, { bets: [] })
  const [loading, setLoading] = useState(true)

  const fetchBets = async () => {
    setLoading(true)
    // const response = await fetch('https://qbtn.qubic.org/get_active_bets')  // test system
    const response = await fetch('https://qb.qubic.org/get_active_bets')   // live system
    const data = await response.json()

    if (data.bet_list) {
      data.bet_list.forEach(bet => {
        // parse list fields using JSON.parse
        bet.oracle_fee = JSON.parse(bet.oracle_fee)
        bet.oracle_id = JSON.parse(bet.oracle_id)
        bet.option_desc = JSON.parse(bet.option_desc)
        bet.betting_odds = JSON.parse(bet.betting_odds)
        bet.current_bet_state = JSON.parse(bet.current_bet_state)
        bet.current_num_selection = JSON.parse(bet.current_num_selection)
        bet.oracle_vote = JSON.parse(bet.oracle_vote)
        const closeDate = new Date('20' + bet.close_date + 'T' + bet.close_time + 'Z')
        const now = new Date()
        bet.isActive = now <= closeDate
        // add an expires_in field to each bet based on open_date and close_date
        // const diff = closeDate - now
        // let days = Math.floor(diff / (1000 * 60 * 60 * 24))
        // Ensure days is not negative
        // if (days < 0) days = 0
        // bet.expires_in = days        
      })
      console.log('fetchBets', data)
      dispatch({ 
        type: 'SET_BETS', 
        payload: data.bet_list 
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchBets()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <BetContext.Provider value={{ state, dispatch, loading, fetchBets }}>
      {children}
    </BetContext.Provider>
  )
}

export const useBetContext = () => useContext(BetContext)
