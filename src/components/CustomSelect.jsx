import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const CustomSelect = ({ 
  value, 
  onChange, 
  options, 
  placeholder = '-- Chọn --', 
  disabled = false, 
  className = '', 
  style = {} 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside); // For mobile
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (val) => {
    if (disabled) return;
    // Simulate event format for compatibility with existing onChange handlers
    onChange({ target: { value: val } });
    setIsOpen(false);
  };

  return (
    <div className={`custom-select-container ${className}`} style={style} ref={containerRef}>
      <div 
        className={`custom-select-trigger ${disabled ? 'disabled' : ''} ${isOpen ? 'open' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? 'selected-text' : 'placeholder-text'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={18} className={`select-icon ${isOpen ? 'open' : ''}`} />
      </div>

      {isOpen && (
        <div className="custom-select-dropdown animate-slide-up">
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`custom-select-option ${opt.value === value ? 'selected' : ''}`}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
