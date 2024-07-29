import React, { useEffect, useState } from 'react';
import InputMaxChars from './qubic/ui/InputMaxChars';

const OptionsList = ({ max, options: initialOptions, onChange }) => {
  const [options, setOptions] = useState(initialOptions);

  useEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    onChange(newOptions);
  };

  const handleAddOption = (event) => {
    event.preventDefault();
    if (options.length < max) {
      const newOptions = [...options, ''];
      setOptions([...newOptions]);
      onChange(newOptions);
    }
  };

  const handleDeleteOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    onChange(newOptions);
  };

  return (
    <div className="space-y-4">
      {options.map((option, index) => (
        <div key={index} className="flex items-center space-x-2">
          <div className="flex-grow">
            <InputMaxChars
              id={`option-${index}`}
              label={`Option ${index + 1}`}
              max={50}
              placeholder="Enter option"
              initialValue={option}
              onChange={(value) => handleOptionChange(index, value)}
            />
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleDeleteOption(index)
            }}
            className="text-red-500 disabled:text-gray-500"
            disabled={options.length <= 2} // Disable delete button if there are only 2 options
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ))}
      {options.length < max && (
        <button
          onClick={handleAddOption}
          className="bg-primary-40 text-black p-2 rounded-lg"
        >
          Add Option
        </button>
      )}
    </div>
  );
};

export default OptionsList;
