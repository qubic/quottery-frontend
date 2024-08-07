import React, { useEffect, useState } from 'react';
import InputMaxChars from './qubic/ui/InputMaxChars';
import InputRegEx from './qubic/ui/InputRegEx';

const ProvidersList = ({ max, providers: initialProviders, onChange }) => {
  const [providers, setProviders] = useState(initialProviders);
  const [errors, setErrors] = useState({});

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
      const newProviders = [...providers, { publicId: '', fee: '' }];
      setProviders(newProviders);
      onChange(newProviders);
    }
  };

  const handleDeleteProvider = (index) => {
    const newProviders = providers.filter((_, i) => i !== index);
    setProviders([...newProviders]);
    onChange(newProviders);
  };

  useEffect(() => {
    const validateProviders = () => {
      const newErrors = {};
      providers.forEach((provider, index) => {
        if (!provider.name) {
          newErrors[`publicId_${index}`] = 'Oracle ID is required';
        }
        if (!provider.fee) {
          newErrors[`fee_${index}`] = 'Fee is required';
        }
      });
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
    validateProviders();
  }, [providers]);

  return (
    <div className="space-y-4">
      {providers.map((provider, index) => (
        <div key={index} className="flex items-stretch space-x-2">
          <div className="flex-grow">
            <InputMaxChars
              id={`provider-publicId-${index}`}
              label={`Oracle ${index + 1} - ID`}
              max={60}
              placeholder="Enter Oracle ID"
              initialValue={provider.publicId}
              onChange={(value) => handleProviderChange(index, 'publicId', value)}
            />
            {errors[`publicId_${index}`] && <p className="text-red-500">{errors[`publicId_${index}`]}</p>}
          </div>
          <div className="w-32">
            <InputRegEx
              id={`provider-fee-${index}`}
              label={`Fee %`}
              initialValue={provider.fee}
              onChange={(value) => handleProviderChange(index, 'fee', value)}
            />
            {errors[`fee_${index}`] && <p className="text-red-500">{errors[`fee_${index}`]}</p>}
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
