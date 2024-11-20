/**
 * @author Dakota Soares
 * @version 1.1
 * @description Meatball Menu Component
 */

import React, { useState, useRef, useEffect } from 'react';
import './MeatballMenu.css';

interface MeatballMenuProps {
  options: Array<{
    label: string;
    onClick: () => void;
  }>;
}

const MeatballMenu: React.FC<MeatballMenuProps> = ({ options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandUpwards, setExpandUpwards] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen && buttonRef.current && menuRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const menuHeight = menuRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;

      const spaceBelow = viewportHeight - buttonRect.bottom - 50; // 50px for footer
      if (menuHeight > spaceBelow) {
        setExpandUpwards(true);
      } else {
        setExpandUpwards(false);
      }
    }
  }, [isOpen]);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target as Node) &&
      buttonRef.current &&
      !buttonRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="meatball-menu-container">
      <button className="meatball-menu" onClick={toggleMenu} ref={buttonRef}>
        ⋮
      </button>
      {isOpen && (
        <div
          className={`meatball-menu-options ${expandUpwards ? 'expand-upwards' : ''}`}
          ref={menuRef}
        >
          {options.map((option, index) => (
            <button
              key={index}
              className="menu-option"
              onClick={() => {
                option.onClick();
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeatballMenu;
