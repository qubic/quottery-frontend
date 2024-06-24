import React, { useState } from 'react'

const Dropdown = ({ label, options, selected, setSelected }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen)
    }

    return (
        <div className="relative">
            <span
                className="text-primary-40 font-space cursor-pointer"
                onClick={toggleDropdown}
            >
                {label}
            </span>
        {isDropdownOpen && (
            <div className="absolute mt-2 bg-white border border-gray-300 rounded shadow-lg">
                {options.map((option, index) => (
                    <div
                        key={index}
                        className="block px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                            setSelected(index)
                            toggleDropdown()
                        }}
                    >
                        {option.label}
                    </div>
                ))}                
            </div>
        )}
        </div>
    )
}

export default Dropdown