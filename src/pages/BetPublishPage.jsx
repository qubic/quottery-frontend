import React, {useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {useQuotteryContext} from '../contexts/QuotteryContext'
import {useQubicConnect} from '../contexts/QubicConnectContext'
import ConfirmTxModal from '../components/qubic/connect/ConfirmTxModal'
import Card from '../components/qubic/Card'
import {formatDate} from '../components/qubic/util/commons'

const BetPublishPage = () => {
  const {id} = useParams()
  const {state, fetchBets, publishResult, walletPublicIdentity} = useQuotteryContext()
  const {connected, toggleConnectModal} = useQubicConnect()
  const [bet, setBet] = useState(null)
  const [selectedOption, setSelectedOption] = useState(null)
  const [showConfirmTxModal, setShowConfirmTxModal] = useState(false)
  const navigate = useNavigate()
  const [isOracleProvider, setIsOracleProvider] = useState(false)
  const [isAfterEndDate, setIsAfterEndDate] = useState(false)
  const [hasEnoughParticipants, setHasEnoughParticipants] = useState(false)
  const [hasAlreadyPublished, setHasAlreadyPublished] = useState(false)
  const [canPublish, setCanPublish] = useState(false)

  useEffect(() => {
    const fetchBetAndCheckConditions = async () => {
      if (!connected || !walletPublicIdentity) {
        toggleConnectModal()
        return
      }

      const bets = [...state.activeBets, ...state.lockedBets, ...state.waitingForResultsBets, ...state.historicalBets]

      const betDetails = bets.find((b) => b.bet_id === parseInt(id))
      if (betDetails) {
        setBet(betDetails)

        // Check if user is an Oracle Provider
        const isProvider = betDetails.oracle_id.includes(walletPublicIdentity)
        setIsOracleProvider(isProvider)

        if (!isProvider) {
          alert('You are not authorized to publish the result of this bet.')
          navigate('/')
          return
        }

        // Check if current date exceeds bet's end date
        const endDateTime = new Date('20' + betDetails.end_date + 'T' + betDetails.end_time + 'Z')
        const now = new Date()
        const afterEndDate = now > endDateTime
        setIsAfterEndDate(afterEndDate)

        // Check if at least one option has been joined
        const numOptionsJoined = betDetails.current_num_selection.filter(num => num > 0).length
        const enoughParticipants = numOptionsJoined >= 1
        setHasEnoughParticipants(enoughParticipants)

        // Check if the Oracle Provider has already published
        const betResultOPId = betDetails.betResultOPId || []

        // Get indices of Oracles who have published
        const publishedOracleIndices = betResultOPId.filter(value => value !== -1)

        // Map indices to Oracle IDs
        const votedOracles = publishedOracleIndices.map(index => betDetails.oracle_id[index])

        const hasPublished = votedOracles.includes(walletPublicIdentity)
        setHasAlreadyPublished(hasPublished)

        // Determine if the user can publish
        setCanPublish(afterEndDate && enoughParticipants && !hasPublished)
      } else {
        await fetchBets('all')
      }
    }

    fetchBetAndCheckConditions()
  }, [id, state, walletPublicIdentity, connected, navigate, toggleConnectModal])

  const handlePublish = async () => {
    if (!connected) {
      toggleConnectModal()
      return
    }
    setShowConfirmTxModal(true)
  }

  return (
    <div className="mt-[90px] sm:px-30 md:px-130">
      <div className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl text-white">Publish Bet Result</h1>
        {bet && isOracleProvider && (
          <>
            {!isAfterEndDate && (
              <p className="text-gray-50 mt-4">
                Publish bet (please come back after {formatDate(bet.end_date)}{' '}{bet.end_time} UTC)
              </p>
            )}
            {isAfterEndDate && !hasEnoughParticipants && (
              <p className="text-gray-50 mt-4">Publish bet (not enough parties joined the bet)</p>
            )}
            {isAfterEndDate && hasEnoughParticipants && hasAlreadyPublished && (
              <p className="text-gray-50 mt-4">Publish bet (already published)</p>
            )}
            {canPublish && (
              <>
                <Card className="p-[24px] w-full mt-[16px]">
                  <h2 className="text-xl text-white">{
                    bet.full_description ? bet.full_description : bet.bet_desc
                  }</h2>
                  <p className="text-gray-50">Bet ID: {bet.bet_id}</p>
                </Card>
                <div className="mt-4">
                  <h3 className="text-white mb-2">Select Winning Option</h3>
                  {bet.option_desc.map((option, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="radio"
                        name="winningOption"
                        value={index}
                        checked={selectedOption === index}
                        onChange={() => setSelectedOption(index)}
                        className="mr-2"
                      />
                      <label className="text-white">{option}</label>
                    </div>
                  ))}
                </div>
                <button
                  className="mt-4 p-2 bg-primary-40 text-black rounded-lg"
                  onClick={handlePublish}
                  disabled={selectedOption === null}
                >
                  Publish Result
                </button>
              </>
            )}
          </>
        )}
      </div>
      <ConfirmTxModal
        open={showConfirmTxModal}
        onClose={() => {
          setShowConfirmTxModal(false)
          navigate('/')
        }}
        tx={{
          title: 'Publish Result',
          description: 'Are you sure you want to publish this result?',
        }}
        onConfirm={async () => {
          return await publishResult(bet.bet_id, selectedOption)
        }}
      />
    </div>
  )
}

export default BetPublishPage
