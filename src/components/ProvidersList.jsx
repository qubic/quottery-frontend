import React, { useEffect, useState } from 'react';
import InputMaxChars from './qubic/ui/InputMaxChars';
import InputNumbersOnly from './qubic/ui/InputNumbersOnly';

const ProvidersList = ({ max, providers: initialProviders, onChange }) => {
  const [providers, setProviders] = useState(initialProviders);

  useEffect(() => {
    setProviders(initialProviders);
  }, [initialProviders]);

  const handleProviderChange = (index, field, value) => {
    const newProviders = [...providers];
    newProviders[index] = { ...newProviders[index], [field]: value };
    setProviders(newProviders);
    onChange(newProviders);
  };

  const handleAddProvider = (event) => {
    event.preventDefault();
    if (providers.length < max) {
      const newProviders = [...providers, { name: '', fee: '' }];
      setProviders(newProviders);
      onChange(newProviders);
    }
  };

  const handleDeleteProvider = (index) => {
    const newProviders = providers.filter((_, i) => i !== index);
    setProviders([...newProviders]);
    onChange(newProviders);
  };

  return (
    <div className="space-y-4">
      {providers.map((provider, index) => (
        <div key={index} className="flex items-stretch space-x-2">
          <div className="flex-grow">
            <InputMaxChars
              id={`provider-name-${index}`}
              label={`Oracle ${index + 1} ID`}
              max={50}
              placeholder="Enter Oracle ID"
              initialValue={provider.name}
              onChange={(value) => handleProviderChange(index, 'name', value)}
            />
          </div>
          <div className="w-32">
            <InputNumbersOnly
              id={`provider-fee-${index}`}
              label={`Oracle ${index + 1} Fee`}
              initialValue={provider.fee}
              onChange={(value) => handleProviderChange(index, 'fee', value)}
            />
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleDeleteProvider(index);
            }}
            className="text-red-500 disabled:text-gray-500"
            disabled={providers.length <= 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      {providers.length < max && (
        <button
          onClick={handleAddProvider}
          className="bg-primary-40 text-black p-2 rounded-lg"
        >
          Add Provider
        </button>
      )}
    </div>
  );
};

export default ProvidersList;
