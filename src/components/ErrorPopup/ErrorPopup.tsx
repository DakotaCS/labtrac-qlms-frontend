/**
 * @author Dakota Soares
 * @version 1.1
 * @description Error Popup Component
 */

import React, { useEffect, useState } from 'react';
import './ErrorPopup.css';

interface ErrorPopupProps {
  error: string | null;
  onClose: () => void;
}

const ErrorPopup: React.FC<ErrorPopupProps> = ({ error, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible || !error) {
    return null;
  }

  return (
    <div className="error-popup">
      <p>{error}</p>
    </div>
  );
};

export default ErrorPopup;
