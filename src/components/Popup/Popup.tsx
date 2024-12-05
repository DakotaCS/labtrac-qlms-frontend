/**
 * @author Dakota Soares
 * @version 1.1
 * @description Popup Component
 */

import React from 'react';
import './Popup.css';

interface PopupProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Popup: React.FC<PopupProps> = ({ title, onClose, children }) => {
  return (
    <div className="popup-overlay">
      <div className="popup">
        <button className="popup-close" onClick={onClose}>×</button>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
};

export default Popup;
