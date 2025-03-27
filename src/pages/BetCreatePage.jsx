/* global BigInt */
import React, {useRef, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import SelectDateTime from '../components/qubic/ui/SelectDateTime'
import InputMaxChars from '../components/qubic/ui/InputMaxChars'
import FormHead from '../components/qubic/ui/FormHead'
import OptionsList from '../components/OptionsList'
import ProvidersList from '../components/ProvidersList'
import InputNumbers from '../components/qubic/ui/InputNumbers'
import ConfirmTxModal from '../components/qubic/connect/ConfirmTxModal'
import {useQubicConnect} from '../contexts/QubicConnectContext'
import BetCreateConfirm from '../components/BetCreateConfirm'
import {useQuotteryContext} from "../contexts/QuotteryContext"
import {QubicHelper} from "@qubic-lib/qubic-ts-library/dist/qubicHelper"
import {hashBetData, hashUniqueData} from "../components/qubic/util/hashUtils"
import {formatQubicAmount} from "../components/qubic/util"
import LabelWithPopover from "../components/qubic/ui/LabelWithPopover"
import {externalJsonAssetUrl} from "../components/qubic/util/commons";

function BetCreatePage() {

  const navigate = useNavigate()
  const [showConfirmTxModal, setShowConfirmTxModal] = useState(false)
  const {connected, toggleConnectModal, wallet} = useQubicConnect()
  const {
    fetchBets,
    issueBet,
    balance,
    issueBetTxCosts,
    fetchBalance,
    walletPublicIdentity,
    state,
  } = useQuotteryContext()

  const [bet, setBet] = useState({
    description: '',
    closeDateTime: '',
    endDateTime: '',
    options: ['', ''],
    providers: [{
      publicId: '',
      fee: ''
    }],
    amountPerSlot: '',
    maxBetSlots: '',
  })
  const [errors] = useState({})

  const descriptionRef = useRef()
  const closeDateTimeRef = useRef()
  const endDateTimeRef = useRef()
  const optionsRef = useRef()
  const amountPerSlotRef = useRef()
  const maxBetSlotsRef = useRef()
  const providersRef = useRef()

  const validateForm = () => {
    const isDescriptionValid = descriptionRef.current.validate()
    const isCloseDateTimeValid = closeDateTimeRef.current.validate()
    const isEndDateTimeValid = endDateTimeRef.current.validate()
    const isOptionsValid = optionsRef.current.validate()
    const isProvidersValid = providersRef.current.validate()
    const isAmountPerSlotValid = amountPerSlotRef.current.validate()
    const isMaxBetSlotsValid = maxBetSlotsRef.current.validate()

    if (bet.closeDateTime && bet.endDateTime) {
      const closeDateTime = new Date(`${bet.closeDateTime.date}T${bet.closeDateTime.time}Z`)
      const endDateTime = new Date(`${bet.endDateTime.date}T${bet.endDateTime.time}Z`)

      if (endDateTime <= closeDateTime) {
        alert('End DateTime must be after Close DateTime.')
        return false
      }

    }

    return (
      isDescriptionValid &&
      isCloseDateTimeValid &&
      isEndDateTimeValid &&
      isOptionsValid &&
      isProvidersValid &&
      isAmountPerSlotValid &&
      isMaxBetSlotsValid
    )
  }

  const getCreatorIdentity = async () => {
    const qHelper = new QubicHelper()
    const idPackage = await qHelper.createIdPackage(wallet)
    const sourcePublicKey = idPackage.publicKey
    return await qHelper.getIdentity(sourcePublicKey)
  }


  const uploadDescription = async (description, encodedHash) => {
    try {
      const response = await fetch(`${externalJsonAssetUrl}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({hash: encodedHash, description}),
      })
      const data = await response.json()
      return data.success
    } catch (error) {
      console.error('Error uploading description:', error)
      return false
    }
  }

  const handleOptionsChange = newOptions => setBet({...bet, options: newOptions})
  const handleCloseDateTimeChange = dateTime => {
    setBet(prevBet => {
      const newBet = {...prevBet, closeDateTime: dateTime}

      if (prevBet.endDateTime && prevBet.endDateTime.date && prevBet.endDateTime.time) {
        const closeDateTime = new Date(`${dateTime.date}T${dateTime.time}Z`)
        const endDateTime = new Date(`${prevBet.endDateTime.date}T${prevBet.endDateTime.time}Z`)

        if (endDateTime <= closeDateTime) {
          newBet.endDateTime = '' // Reset end date

          // Reset end date's state
          if (endDateTimeRef.current) {
            endDateTimeRef.current.reset()
          }
        }
      }

      return newBet
    })
  }

  const calculateMinEndDateTime = () => {
    const {date, time} = bet.closeDateTime || {}

    if (!date || !time) {
      return null
    }

    const closeDateTimeStr = `${date}T${time}Z`
    const closeDateTime = new Date(closeDateTimeStr)

    if (isNaN(closeDateTime.getTime())) {
      console.error('Invalid closeDateTime:', closeDateTimeStr)
      return null
    }

    const minEndDateTime = new Date(closeDateTime.getTime() + 60 * 60 * 1000) // Add 1 hour

    const isoString = minEndDateTime.toISOString()
    const minDate = isoString.split('T')[0]
    const minTime = isoString.split('T')[1].slice(0, 5) // Get HH:MM

    return {date: minDate, time: minTime}
  }

  const handleEndDateTimeChange = dateTime => setBet({...bet, endDateTime: dateTime})
  const handleProvidersChange = newProviders => setBet({...bet, providers: newProviders})
  const handleAmountPerSlotChange = value => setBet({...bet, amountPerSlot: value})
  const handleMaxBetSlotsChange = value => setBet({...bet, maxBetSlots: value})

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (connected) {
      if (validateForm()) {
        const closeDateTime = `${bet.closeDateTime.date}T${bet.closeDateTime.time}Z`
        const endDateTime = `${bet.endDateTime.date}T${bet.endDateTime.time}Z`
        const closeDate = new Date(closeDateTime)
        const endDate = new Date(endDateTime)
        const diffHours = (endDate - closeDate) / (1000 * 60 * 60)

        if (diffHours <= 0) {
          console.error('End DateTime must be after Close DateTime.')
          return
        }

        bet.diffHours = diffHours
        console.log('Diff hours:', diffHours)

        // Generate unique identifiers
        const creatorIdentity = await getCreatorIdentity()

        // Generate the first part of the hash
        const firstPartHash = hashBetData(bet.description,
          creatorIdentity,
          bet.providers.map(p => p.publicId),
          bet.options,)

        // Generate the second part of the hash
        const secondPartHash = hashUniqueData()

        // Concatenate both parts to create the final hash
        const finalHash = `${firstPartHash}${secondPartHash}`

        const betDescriptionReference = `###${finalHash}`

        const uploadSuccess = await uploadDescription(bet.description, finalHash)
        if (!uploadSuccess) {
          console.error('Failed to upload description')
          return
        }

        const betCreationFee = await issueBetTxCosts(bet)
        bet.costs = betCreationFee

        if (walletPublicIdentity) {
          await fetchBalance(walletPublicIdentity) // Fetch the latest balance
        }

        if (balance !== null && BigInt(balance) < BigInt(betCreationFee)) {
          alert(`You do not have enough balance to create this bet. Your balance: ${formatQubicAmount(balance)} Qubic${balance > 1 ? 's' : ''}, bet creation fee: ${formatQubicAmount(betCreationFee)} Qubic${betCreationFee > 1 ? 's' : ''}`)
          return
        }

        const betToSend = {
          ...bet,
          description: betDescriptionReference,
          descriptionFull: bet.description
        }

        setBet(betToSend)
        console.log('Valid Bet:', betToSend)
        setShowConfirmTxModal(true)
      } else {
        console.log('Form has errors:', errors)
      }
    } else {
      toggleConnectModal()
    }
  }

  const handleTransactionComplete = async () => {
    if (walletPublicIdentity) {
      await fetchBalance(walletPublicIdentity) // Fetch the latest balance
    }
    // fetchBets('active')
    // navigate('/')
  }

  const nodeInfo = state.nodeInfo || {}
  const minBetSlotAmount = nodeInfo.min_bet_slot_amount || 10000

  return (
    <div className='mt-[90px] sm:px-30 md:px-130'>
      <div className="max-w-3xl mx-auto p-4">

        <FormHead
          title='Create New Bet'
          onBack={() => navigate('/')}
        />

        <form className="space-y-10" onSubmit={handleSubmit}>
          {/* Bet description */}
          <InputMaxChars
            id="description"
            ref={descriptionRef}
            labelComponent={
              <LabelWithPopover
                htmlFor="description"
                label="Bet Description"
                description="This is the bet description with a maximum of 100 characters."
              />
            }
            max={100}
            placeholder="Enter bet description"
            onChange={(value) => {
              setBet({...bet, description: value})
            }}
          />

          {/* Close Date and Time */}
          <SelectDateTime
            ref={closeDateTimeRef}
            labelComponent={
              <LabelWithPopover
                htmlFor="close"
                label="Close Date and Time (UTC timezone)"
                description="The date when the bet will no longer be joinable and will be moved to the Locked Bet section."
              />
            }
            fieldId="close"
            onChange={handleCloseDateTimeChange}
          />

          {/* End Date and Time */}
          <SelectDateTime
            ref={endDateTimeRef}
            labelComponent={
              <LabelWithPopover
                htmlFor="end"
                label="End Date and Time (UTC timezone)"
                description="The date when the oracle providers are allowed to publish the results. After the results have been published, payouts will be made to bettors."
              />
            }
            fieldId="end"
            onChange={handleEndDateTimeChange}
            minDateTime={calculateMinEndDateTime()}
          />

          {/* Bet options */}
          <div>
            <LabelWithPopover
              label="Bet Options (min. 2)"
              description="Options for a bet. Max number of options: 8, min number of options: 2. Press 'Add Option' to add more options. Press 'X' at the end of the option field to remove an option. Each option's max length is 32 characters."
            />
            <OptionsList
              max={8}
              options={bet.options}
              onChange={handleOptionsChange}
              ref={optionsRef}
            />
            {errors.options && <p className="text-red-500">{errors.options}</p>}
          </div>

          {/* Oracle Providers */}
          <div>
            <LabelWithPopover
              label="Oracle Providers (min. 1)"
              description="List the 60-character public address of Oracle Providers and their corresponding fees. The oracle provider publishes the bet's results. Min number of oracle providers is 1, max is 8. It's recommended that the total fees of all oracle providers not exceed 10%. Note that if the fees are too high, no one will join your bet. Press 'Add Provider' to add more Oracle Providers. Press 'X' at the end of the field to remove one."
            />
            <ProvidersList
              max={8}
              providers={bet.providers}
              onChange={handleProvidersChange}
              ref={providersRef}
            />
          </div>

          {/* Settings */}
          <InputNumbers
            id="amountPerSlot"
            labelComponent={
              <LabelWithPopover
                htmlFor="amountPerSlot"
                label="Amount of Qubics per Slot"
                description={`The amount of qubics to debit per slot when someone joins the bet. The minimum amount is ${formatQubicAmount(minBetSlotAmount)} qubics.`}
              />
            }
            placeholder="Enter amount of Qus per slot"
            ref={amountPerSlotRef}
            onChange={handleAmountPerSlotChange}
            minLimit={minBetSlotAmount}
          />

          <InputNumbers
            id="maxBetSlots"
            labelComponent={
              <LabelWithPopover
                htmlFor="maxBetSlots"
                label="Maximum Number of Bet Slots per Option"
                description="Maximum number of bet slots available for all bettors to bet on your bet. The maximum slots per option per bet is 1024 slots."
              />
            }
            placeholder="Enter max bet slots"
            ref={maxBetSlotsRef}
            maxLimit={1024}
            onChange={handleMaxBetSlotsChange}
          />

          {/* Create Bet button */}
          <div>
            <button
              className="w-full p-4 bg-primary-40 text-black rounded-lg"
              onClick={handleSubmit}
            >
              Create Bet
            </button>
          </div>
        </form>
      </div>

      <ConfirmTxModal
        open={showConfirmTxModal}
        onClose={() => {
          fetchBets('active')
          setShowConfirmTxModal(false)
          navigate('/')
        }}
        tx={{
          title: 'Create Bet',
          description: <BetCreateConfirm bet={bet}/>,
        }}
        onConfirm={async () => {
          return await issueBet(bet)
        }}
        onTransactionComplete={handleTransactionComplete}
      />
    </div>
  )
}

export default BetCreatePage
