import React from 'react';

const InputNumbersOnly = ({ id, label, initialValue, onChange }) => {
  const handleChange = (event) => {
    const value = event.target.value;
    // Allow only numbers and dot, and ensure format like 00.00
    if (/^\d{0,2}(\.\d{0,2})?$/.test(value)) {
      onChange(value);
    }
  };

  return (
    <div>
      <label htmlFor={id} className="block text-white mb-2">
        {label}
      </label>
      <input
        id={id}
        type="text"
        className="w-full p-4 bg-gray-80 border border-gray-70 text-white rounded-lg placeholder-gray-500"
        value={initialValue}
        onChange={handleChange}
        placeholder="00.00"
      />
    </div>
  );
};

export default InputNumbersOnly;
