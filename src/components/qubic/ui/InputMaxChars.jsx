import React, { useEffect, useState } from 'react';

const InputMaxChars = ({ id, label, max, placeholder, initialValue = '', onChange }) => {
  const [value, setValue] = useState(initialValue);
  const [numChars, setNumChars] = useState(initialValue.length);

  const handleChange = (event) => {
    const newValue = event.target.value;
    if (newValue.length <= max) {
      setValue(newValue);
      setNumChars(newValue.length);
      onChange(newValue);
    }
  };

  useEffect(() => {
    setValue(initialValue);
    setNumChars(initialValue.length);
  }, [initialValue]);

  return (
    <div>
      <label htmlFor={id} className="block text-white mb-2">
        {label}
      </label>
      <input
        id={id}
        type="text"
        className="w-full p-4 bg-gray-80 text-white rounded-lg placeholder-gray-500 border-2 border-gray-70"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
      />
      <div className="text-right text-gray-500 text-sm mt-1">
        {numChars}/{max}
      </div>
    </div>
  );
};

export default InputMaxChars;
