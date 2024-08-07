import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import SelectDateTime from '../components/qubic/ui/SelectDateTime'
import InputMaxChars from '../components/qubic/ui/InputMaxChars'
import FormHead from '../components/qubic/ui/FormHead'
import OptionsList from '../components/OptionsList'
import ProvidersList from '../components/ProvidersList'
import InputNumbers from '../components/qubic/ui/InputNumbers'
import ConfirmTxModal from '../components/qubic/connect/ConfirmTxModal'
import { useQubicConnect } from '../components/qubic/connect/QubicConnectContext'
import BetCreateConfirm from '../components/BetCreateConfirm'
import { useQuotteryContext } from "../contexts/QuotteryContext"

function BetCreatePage() {

  const navigate = useNavigate()
  const [showConfirmTxModal, setShowConfirmTxModal] = useState(false)
  const { connected, toggleConnectModal } = useQubicConnect()
  const { fetchBets, signIssueBetTx, createTestBet } = useQuotteryContext()

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
  const amountPerSlotRef = useRef();
  const maxBetSlotsRef = useRef();

  const validateForm = () => {
    const isDescriptionValid = descriptionRef.current.validate()
    const isCloseDateTimeValid = closeDateTimeRef.current.validate()
    const isEndDateTimeValid = endDateTimeRef.current.validate()
    const isOptionsValid = bet.options.length >= 2
    const isProvidersValid = bet.providers.length >= 1 && bet.providers.every(provider => provider.publicId && provider.fee)
    const isAmountPerSlotValid = amountPerSlotRef.current.validate()
    const isMaxBetSlotsValid = maxBetSlotsRef.current.validate()

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

  const handleOptionsChange = newOptions => setBet({...bet, options: newOptions})
  const handleCloseDateTimeChange = dateTime => setBet({ ...bet, closeDateTime: dateTime })
  const handleEndDateTimeChange = dateTime => setBet({ ...bet, endDateTime: dateTime })
  const handleProvidersChange = newProviders => setBet({...bet, providers: newProviders})
  const handleAmountPerSlotChange = value => setBet({ ...bet, amountPerSlot: value })
  const handleMaxBetSlotsChange = value => setBet({ ...bet, maxBetSlots: value })
  const handleSubmit = (event) => {
    event.preventDefault()
    if(connected) {
      if (validateForm()) {
        // calculate diffHours of closeDateTime and endDateTime
        const closeDateTime = new Date(bet.closeDateTime.date + ' ' + bet.closeDateTime.time)
        const endDateTime = new Date(bet.endDateTime.date + ' ' + bet.endDateTime.time)
        const diffHours = (endDateTime - closeDateTime) / 1000 / 60 / 60
        bet.diffHours = diffHours
        console.log('Valid Bet:', bet)
        setShowConfirmTxModal(true)
      } else {
        console.log('Form has errors:', errors)
      }
    }else{
      toggleConnectModal()
    }
  }

  return (
    <div className='mt-[90px] sm:px-30 md:px-130'>
      <div className="max-w-md mx-auto p-4">

        <FormHead
          title='Create New Bet'
          onBack={() => navigate('/')}
        />

        <form className="space-y-10" onSubmit={handleSubmit}>
          {/* Bet description */}
          <InputMaxChars
            id="description"
            ref={descriptionRef}
            label="Bet description"
            max={100}
            placeholder="Enter bet description"
            onChange={(value) => {
              setBet({ ...bet, description: value })
            }}
          />

          {/* Expiration dates */}
          <SelectDateTime
            ref={closeDateTimeRef}
            label="Close Date and Time"
            fieldId="close"
            onChange={handleCloseDateTimeChange}
          />

          <SelectDateTime
            ref={endDateTimeRef}
            label="End Date and Time"
            fieldId="end"
            onChange={handleEndDateTimeChange}
          />

          {/* Bet options */}
          <div>
            <span className="block text-white mb-2">
              Bet Options (min. 2)
            </span>
            <p className='text-grey mb-5'>Here we go with a small help description.</p>

            <OptionsList
              max={20}
              options={bet.options}
              onChange={handleOptionsChange}
            />
            {errors.options && <p className="text-red-500">{errors.options}</p>}
          </div>

          {/* Oracle Providers */}
          <div>
            <span className="block text-white mb-2">
              Oracle Providers (min. 1)
            </span>
            <p className='text-grey mb-5'>Here we go with a small help description.</p>

            <ProvidersList
              max={8}
              providers={bet.providers}
              onChange={handleProvidersChange}
            />
          </div>

          {/* Settings */}
          <InputNumbers
            id="amountPerSlot"
            label="Amount of Qus per Slot"
            placeholder="Enter amount of Qus per slot"
            description="Here we go with a small help description."
            ref={amountPerSlotRef}
            onChange={handleAmountPerSlotChange}
          />

          <InputNumbers
            id="maxBetSlots"
            label="Maximum Number of Bet Slots per Option"
            placeholder="Enter max bet slots"
            description="Here we go with a small help description."
            ref={maxBetSlotsRef}
            onChange={handleMaxBetSlotsChange}
          />

          <button className='bg-primary-40 p-4 rounded-lg'
            onClick={(e) => {
              e.preventDefault()
              createTestBet()
          }}>
              Test Bet
          </button>

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
          description: <BetCreateConfirm bet={bet} />,
        }}
        onConfirm={async () => {
          const confirmed = await signIssueBetTx(bet)
          return confirmed
        }}
      />
    </div>
  )
}

export default BetCreatePage
