import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SelectDateTime from '../components/qubic/ui/SelectDateTime'
import InputMaxChars from '../components/qubic/ui/InputMaxChars'
import FormHead from '../components/qubic/ui/FormHead'
import OptionsList from '../components/OptionsList'
import ProvidersList from '../components/ProvidersList'
import LabelWithPopover from '../components/qubic/ui/LabelWithPopover'

function BetCreatePage() {

  const navigate = useNavigate()

  const [bet, setBet] = useState({
    description: '',
    closeDateTime: '',
    endDateTime: '',
    options: ['', ''],
    providers: [{ name: '', fee: '' }],
    fee: ''
  })
  const [options, setOptions] = useState(bet.options);

  const handleOptionsChange = (newOptions) => {
    setOptions(newOptions);
  };

  const handleCloseDateTimeChange = (dateTime) => {
    console.log('Close Date and Time:', dateTime)
    // update close date and time of bet state
    setBet({ ...bet, closeDateTime: dateTime })
  }

  const handleEndDateTimeChange = (dateTime) => {
    console.log('End Date and Time:', dateTime)
    // update end date and time of bet state
    setBet({ ...bet, endDateTime: dateTime })
  }

  const [providers, setProviders] = useState([{ name: '', fee: '' }]);

  const handleProvidersChange = (newProviders) => {
    setProviders(newProviders);
  };

  return (
    <div className='mt-[90px] sm:px-30 md:px-130'>
      <div className="max-w-md mx-auto p-4">

        <FormHead
          title='Create New Bet'
          onBack={() => navigate('/')}
        />

        <form className="space-y-10">
          {/* Bet description */}
          <InputMaxChars
            id="description"
            label="Bet description"
            max={100}
            placeholder="Enter bet description"
            onChange={(value) => {
              // update bet description of bet state
              setBet({ ...bet, description: value })
              console.log('Bet description:', value)
            }}
          />

          {/* Expiration dates */}
          <SelectDateTime
            label="Close Date and Time"
            fieldId="close"
            onChange={handleCloseDateTimeChange}
          />

          <SelectDateTime
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
              options={options}
              onChange={handleOptionsChange}
            />
          </div>

          {/* Oracle Providers */}
          <div>
            <span className="block text-white mb-2">
              Oracle Providers (min. 1)
            </span>
            <p className='text-grey mb-5'>Here we go with a small help description.</p>

            <ProvidersList
              max={8}
              providers={providers}
              onChange={handleProvidersChange}
            />
          </div>

          {/* Settings */}
          <div>
            <LabelWithPopover
              label="Number of Qus per Slot"
              description="Here we go with a small help description."
            />
            <input
              id="fee"
              type="number"
              className="w-full p-4 bg-gray-80 border border-gray-70 text-white rounded-lg placeholder-gray-500"
              placeholder="Enter fee and rate"
            />
          </div>

          <div>
            <LabelWithPopover
              label="Maximum Number of Bet Slots per Option"
              description="Here we go with a small help description."
            />
            <input
              id="fee"
              type="number"
              className="w-full p-4 bg-gray-80 border border-gray-70 text-white rounded-lg placeholder-gray-500"
              placeholder="Enter fee and rate"
            />
          </div>

          {/* Create Bet button */}
          <div>
            <button
              type="submit"
              className="w-full p-4 bg-primary-40 text-black rounded-lg"
            >
              Create Bet
            </button>
          </div>
        </form>
      </div>

    </div>
  )
}

export default BetCreatePage
