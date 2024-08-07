import React, { useState, forwardRef, useImperativeHandle } from 'react';
import LabelWithPopover from './LabelWithPopover';

const InputNumbers = forwardRef(({ id, label, placeholder, description, onChange }, ref) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (newValue === '') {
      setError('This field is required');
    } else {
      setError('');
    }
    onChange(newValue);
  };

  useImperativeHandle(ref, () => ({
    validate: () => {
      if (value === '') {
        setError('This field is required');
        return false;
      }
      setError('');
      return true;
    }
  }))

  return (
    <div>
      <LabelWithPopover label={label} description={description} />
      <input
        id={id}
        type="number"
        className={`w-full p-4 bg-gray-80 border border-gray-70 text-white rounded-lg placeholder-gray-500 ${error && 'border-red-500'}`}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
      />
      {error && <p className="text-red-500 text-right">{error}</p>}
    </div>
  );
});

export default InputNumbers;
