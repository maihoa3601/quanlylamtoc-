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
    onChange({ target: { value: val } });
    setIsOpen(false);
  };

  const handleToggle = (e) => {
    if (disabled) return;
    // Ngăn event nổi bọt gây đóng mở loạn xạ khi click
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className={`custom-select-container ${className}`} style={style} ref={containerRef}>
      <div 
        className={`custom-select-trigger ${disabled ? 'disabled' : ''} ${isOpen ? 'open' : ''}`}
        onPointerDown={handleToggle}
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
              onPointerDown={(e) => {
                e.preventDefault(); // Ngăn focus bị mất khi click bằng chuột
                e.stopPropagation();
                handleSelect(opt.value);
              }}
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
