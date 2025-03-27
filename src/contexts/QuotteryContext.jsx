/* global BigInt */
import React, {createContext, useContext, useEffect, useReducer, useState} from 'react'
import {QubicHelper} from '@qubic-lib/qubic-ts-library/dist/qubicHelper'
import {useQubicConnect} from './QubicConnectContext'
import {fetchActiveBets, fetchAndVerifyBetDescription, fetchBetDetail, fetchNodeInfo} from '../components/api/betApi'
import {excludedBetIds} from '../components/qubic/util/commons'
import {TICK_OFFSET, useConfig} from "./ConfigContext"
import {buildIssueBetTx, buildJoinBetTx, buildPublishResultTx} from '../components/api/QuotteryApi'

const QuotteryContext = createContext()

const betReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CORE_BETS':
      return {
        ...state,
        activeBets: action.payload.activeBets,
        lockedBets: action.payload.lockedBets,
        waitingForResultsBets: action.payload.waitingForResultsBets,
      };
    case 'SET_HISTORICAL_BETS':
      return {
        ...state,
        historicalBets: action.payload.bets,
        historicalPagination: action.payload.pagination,
      };
    case 'SET_NODE_INFO':
      return {
        ...state,
        nodeInfo: action.payload,
      };
    default:
      return state;
  }
}

export const QuotteryProvider = ({children}) => {
  const [state, dispatch] = useReducer(betReducer, {
    activeBets: [],
    lockedBets: [],
    waitingForResultsBets: [],
    historicalBets: [],
    historicalPagination: {currentPage: 1, totalPages: 1},
    nodeInfo: {},
  })
  const [loading, setLoading] = useState(true)
  const [betsFilter, setBetsFilter] = useState('active')
  const {wallet, connected, broadcastTx, getTick, signTransaction, getSourcePublicKey} = useQubicConnect()
  const [balance, setBalance] = useState(null)
  const [walletPublicIdentity, setWalletPublicIdentity] = useState('')
  const qHelper = new QubicHelper()
  const [coreNodeBetIds, setCoreNodeBetIds] = useState([])
  const [historicalLoading, setHistoricalLoading] = useState(false)
  const [currentFilterOption, setCurrentFilterOption] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [inputPage, setInputPage] = useState('')
  const {httpEndpoint, backendUrl} = useConfig()


  // Fetch bets using the Qubic HTTP API
  const fetchQubicHttpApiBets = async (maxRetryCount = 3) => {
    for (let i = 0; i < maxRetryCount; i++) {
      try {
        const activeBetIds = await fetchActiveBets(httpEndpoint);

        const filteredBetIds = activeBetIds.filter(id => !excludedBetIds.includes(id))
        setCoreNodeBetIds(filteredBetIds)
        return Promise.all(filteredBetIds.map(async (betId) => {
            const bet = await fetchBetDetail(httpEndpoint, backendUrl, betId, filteredBetIds)
            bet.creator = await qHelper.getIdentity(bet.creator); // Update creator field with human-readable identity
            bet.oracle_public_keys = bet.oracle_id
            bet.oracle_id = await Promise.all(
              bet.oracle_id.map(async (oracleId) => {
                return await qHelper.getIdentity(oracleId);
              })
            );
            const closeDate = new Date('20' + bet.close_date + 'T' + bet.close_time + 'Z');
            bet.is_active = new Date() <= closeDate;

            return bet;
          })
        );
      } catch (error) {
        console.log('Error occurred while fetching bets with Qubic Http.', error);
        if (i === maxRetryCount - 1) {
          console.log('Falling back to backend API.')
          return null;
        }
      }
    }
  }

  const fetchHistoricalBets = async (coreNodeBets, filter, page = 1) => {
    setHistoricalLoading(true)
    let backendBets = []
    let paginationInfo = {currentPage: 1, totalPages: 1}
    try {
      const backendData = await fetchBackendApiBets('inactive', page, 10)
      backendBets = backendData.bets
      paginationInfo = backendData.pagination
    } catch (error) {
      console.error('Error fetching bets from backend API:', error)
    }
    const backendBetsUnique = backendBets.filter(
      (backendBet) => !coreNodeBets.some((coreBet) => areBetsEqual(coreBet, backendBet))
    )

    dispatch({
      type: 'SET_HISTORICAL_BETS',
      payload: {bets: backendBetsUnique, pagination: paginationInfo},
    })
    setHistoricalLoading(false)
  }

  const fetchBackendApiBets = async (filter, page = 1, pageSize = 10) => {
    const response = await fetch(
      `${backendUrl}/get_${filter}_bets?page_size=${pageSize}&page=${page}`
    )
    const data = await response.json()

    const paginationInfo = data.page || {
      current_page: 1,
      total_pages: 1
    }

    let filteredBetList = data.bet_list || []
    for (const bet of filteredBetList) {
      // parse list fields using JSON.parse
      bet.oracle_fee = JSON.parse(bet.oracle_fee);
      bet.oracle_id = JSON.parse(bet.oracle_id);
      bet.option_desc = JSON.parse(bet.option_desc);
      bet.betting_odds = JSON.parse(bet.betting_odds);
      bet.current_bet_state = JSON.parse(bet.current_bet_state);
      bet.amount_per_bet_slot = BigInt(bet.amount_per_bet_slot);
      bet.current_num_selection = JSON.parse(bet.current_num_selection);
      bet.oracle_vote = JSON.parse(bet.oracle_vote);
      const closeDate = new Date('20' + bet.close_date + 'T' + bet.close_time + 'Z');
      bet.is_active = new Date() <= closeDate

      // Normalize field names to match new API :-)
      bet.nOption = bet.no_options
      bet.maxBetSlotPerOption = bet.max_slot_per_option
      bet.oracle_public_keys = null

      await fetchAndVerifyBetDescription(bet)
    }
    return {
      bets: filteredBetList,
      pagination: {
        currentPage: paginationInfo.current_page,
        totalPages: paginationInfo.total_pages,
      },
    }
  };

  const areBetsEqual = (bet1, bet2) => {
    // Compare all relevant fields of the bets
    return (
      bet1.bet_id === bet2.bet_id &&
      bet1.nOption === bet2.nOption &&
      bet1.creator === bet2.creator &&
      bet1.bet_desc === bet2.bet_desc &&
      JSON.stringify(bet1.option_desc) === JSON.stringify(bet2.option_desc) &&
      JSON.stringify(bet1.oracle_id) === JSON.stringify(bet2.oracle_id) &&
      JSON.stringify(bet1.oracle_fee) === JSON.stringify(bet2.oracle_fee) &&
      bet1.open_date === bet2.open_date &&
      bet1.close_date === bet2.close_date &&
      bet1.end_date === bet2.end_date &&
      bet1.open_time.split(':').slice(0, 2).join(':') === bet2.open_time.split(':').slice(0, 2).join(':') &&
      bet1.close_time === bet2.close_time &&
      bet1.end_time === bet2.end_time &&
      bet1.amount_per_bet_slot === bet2.amount_per_bet_slot &&
      bet1.maxBetSlotPerOption === bet2.maxBetSlotPerOption &&
      JSON.stringify(bet1.current_bet_state) === JSON.stringify(bet2.current_bet_state) &&
      JSON.stringify(bet1.current_num_selection) === JSON.stringify(bet2.current_num_selection) &&
      Number(bet1.current_total_qus) === Number(bet2.current_total_qus) &&
      JSON.stringify(bet1.betting_odds.map(odd => Number(odd))) === JSON.stringify(bet2.betting_odds.map(odd => Number(odd)))
    );
  };

  const fetchBets = async (filter, page = 1) => {
    setLoading(true)
    // First, attempt to fetch bets from the Qubic HTTP API
    let qubicApiBets = []
    let qubicApiAvailable = true
    try {
      qubicApiBets = await fetchQubicHttpApiBets()
    } catch (error) {
      console.error('Error fetching bets from Qubic HTTP API:', error)
      qubicApiAvailable = false
    }

    // Initialize arrays for categorized bets
    let activeBets = []
    let lockedBets = []
    let waitingForResultsBets = []
    if (qubicApiAvailable && qubicApiBets) {
      // Categorize bets from core node
      const now = new Date()
      for (const bet of qubicApiBets) {
        const closeDate = new Date('20' + bet.close_date + 'T' + bet.close_time + 'Z')
        const endDate = new Date('20' + bet.end_date + 'T' + bet.end_time + 'Z')
        if (now < closeDate) {
          activeBets.push(bet)
        } else if (now >= closeDate && now < endDate) {
          lockedBets.push(bet)
        } else if (now >= endDate) {
          waitingForResultsBets.push(bet)
        }
      }
    }

    // Combine all core node bets for filtering duplication
    let coreNodeBets = [...activeBets, ...lockedBets, ...waitingForResultsBets]
    if (filter === 'inactive' || filter === 'all') {
      await fetchHistoricalBets(coreNodeBets, filter, page)
    }

    // Dispatch bets based on the filter
    dispatch({
      type: 'SET_CORE_BETS',
      payload: {
        activeBets: filter === 'active' || filter === 'all' ? activeBets : [],
        lockedBets: filter === 'locked' || filter === 'all' ? lockedBets : [],
        waitingForResultsBets: filter === 'inactive' || filter === 'all' ? waitingForResultsBets : [],
      },
    })
    await fetchNodeInfoAndUpdate();
    setLoading(false);
  }

  const fetchNodeInfoAndUpdate = async () => {
    try {
      const nodeInfo = await fetchNodeInfo(httpEndpoint, backendUrl);
      nodeInfo.game_operator = await qHelper.getIdentity(nodeInfo.game_operator);
      dispatch({
        type: 'SET_NODE_INFO',
        payload: nodeInfo,
      });
    } catch (error) {
      console.error("Error fetching node info:", error);
    }
  };

  useEffect(() => {
    fetchBets(betsFilter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [betsFilter])

  const fetchBalance = async (publicId) => {
    try {
      const response = await fetch(`${httpEndpoint}/v1/balances/${publicId}`, {
        headers: {
          'accept': 'application/json',
        },
      })
      const data = await response.json()
      setBalance(data.balance.balance)
    } catch (error) {
      console.error('Error fetching balance:', error)
    }
  }

  useEffect(() => {
    const initIdentityAndBalance = async () => {
      if (!wallet) {
        setWalletPublicIdentity("")
        setBalance(null)
        return
      }
      if (wallet.connectType === "walletconnect" || wallet.connectType === "mmSnap") {
        if (wallet.publicKey) {
          setWalletPublicIdentity(wallet.publicKey)
          fetchBalance(wallet.publicKey)
        }
        return
      }
      try {
        const idPackage = await qHelper.createIdPackage(wallet.privateKey || wallet)
        const identity = await qHelper.getIdentity(idPackage.publicKey)
        if (identity) {
          setWalletPublicIdentity(identity)
          fetchBalance(identity)
        }
      } catch (err) {
        console.error("Error creating ID package or fetching identity:", err)
      }
    }
    initIdentityAndBalance()
  }, [wallet])

  // Refresh balance every 5 minutes
  useEffect(() => {
    let intervalId
    if (walletPublicIdentity) {
      intervalId = setInterval(() => {
        fetchBalance(walletPublicIdentity)
      }, 300000) // 5 minutes in milliseconds
    }
    return () => clearInterval(intervalId)
  }, [walletPublicIdentity])

  const issueBetTxCosts = async (bet) => {
    const nodeInfo = await fetchNodeInfo(httpEndpoint, backendUrl)
    return parseInt(bet.maxBetSlots) * bet.options.length * nodeInfo.fee_per_slot_per_hour * calculateDiffHours(bet)
  }

  const calculateDiffHours = (bet) => {
    // Parse the end date-time from the bet object
    const endDateTime = new Date(Date.UTC(
      parseInt(bet.endDateTime.date.split('-')[0]),
      parseInt(bet.endDateTime.date.split('-')[1]) - 1,
      parseInt(bet.endDateTime.date.split('-')[2]),
      parseInt(bet.endDateTime.time.split(':')[0]),
      parseInt(bet.endDateTime.time.split(':')[1]),
      0
    ))

    // Get the current date-time in UTC
    const nowDateTime = new Date()
    const nowUTC = new Date(Date.UTC(
      nowDateTime.getUTCFullYear(),
      nowDateTime.getUTCMonth(),
      nowDateTime.getUTCDate(),
      nowDateTime.getUTCHours(),
      nowDateTime.getUTCMinutes(),
      nowDateTime.getUTCSeconds()
    ))

    // Calculate the difference in milliseconds and convert to hours
    const diffMilliseconds = endDateTime - nowUTC
    return Math.ceil(diffMilliseconds / 1000 / 60 / 60)
  }

  const issueBet = async (bet) => {
    if (!connected || !wallet) {
      return
    }

    try {
      const fee = await issueBetTxCosts(bet)
      const tick = await getTick()
      const finalTick = tick + TICK_OFFSET

      const sourcePublicKey = await getSourcePublicKey()
      const unsignedTx = await buildIssueBetTx(qHelper, sourcePublicKey, finalTick, bet, fee)
      const signedTx = await signTransaction(unsignedTx)

      const txResult = await broadcastTx(signedTx)
      console.log('Issue Bet Response:', txResult)

      return {
        targetTick: finalTick,
        txResult}
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  const joinBet = async (joinData) => {
    if (!connected || !wallet) {
      return
    }

    try {
      const tick = await getTick()
      const finalTick = tick + TICK_OFFSET

      const sourcePublicKey = await getSourcePublicKey()
      const unsignedTx = await buildJoinBetTx(qHelper, sourcePublicKey, finalTick, joinData)
      const signedTx = await signTransaction(unsignedTx)

      const txResult = await broadcastTx(signedTx)
      console.log('Join Bet Response:', txResult)

      return {
        targetTick: finalTick,
        txResult}
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  const publishResult = async (betId, option) => {
    if (!connected || !wallet) {
      return
    }

    try {
      const tick = await getTick()
      const finalTick = tick + TICK_OFFSET

      const sourcePublicKey = await getSourcePublicKey()
      const unsignedTx = await buildPublishResultTx(qHelper, sourcePublicKey, finalTick, betId, option)
      const signedTx = await signTransaction(unsignedTx)

      const txResult = await broadcastTx(signedTx)
      console.log('Publish Result Response:', txResult)

      return {
        targetTick: finalTick,
        txResult}
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  return (
    <QuotteryContext.Provider value={{
      state,
      dispatch,
      loading,
      fetchBets,
      setBetsFilter,
      issueBet,
      joinBet,
      publishResult,
      issueBetTxCosts,
      coreNodeBetIds,
      walletPublicIdentity,
      balance,
      fetchBalance,
      historicalLoading,
      fetchHistoricalBets,
      currentFilterOption,
      setCurrentFilterOption,
      currentPage,
      setCurrentPage,
      inputPage,
      setInputPage,
    }}>
      {children}
    </QuotteryContext.Provider>
  )
}

export const useQuotteryContext = () => useContext(QuotteryContext)
