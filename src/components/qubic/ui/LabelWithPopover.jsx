import React, { useState, useEffect, useRef } from "react";
import circleInfo from "../../../assets/circle-info.svg";

const LabelWithPopover = ({ htmlFor, label, description }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverRef = useRef(null);

  const togglePopover = (e) => {
    e.stopPropagation();
    setIsPopoverOpen(!isPopoverOpen);
  };

  const handleClickOutside = (e) => {
    if (popoverRef.current && !popoverRef.current.contains(e.target)) {
      setIsPopoverOpen(false);
    }
  };

  useEffect(() => {
    if (isPopoverOpen) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }
    // Cleanup event listener on unmount
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isPopoverOpen]);

  return (
    <div className="relative flex items-center">
      <label htmlFor={htmlFor} className="text-white mb-2 flex items-center">
        {label}
        <div className="ml-2 relative" ref={popoverRef}>
          <button
            type="button"
            onClick={togglePopover}
            className="focus:outline-none"
          >
            <img src={circleInfo} alt="Info Icon" className="w-4 h-4" />
          </button>
          {isPopoverOpen && (
            <div className="absolute z-10 left-1/2 transform -translate-x-1/2 mt-2 w-64 p-2 bg-gray-800 text-white text-sm rounded shadow-lg">
              {description}
            </div>
          )}
        </div>
      </label>
    </div>
  );
};

export default LabelWithPopover;
