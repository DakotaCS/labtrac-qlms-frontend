// ./src/components/ErrorPopup.tsx
import React, { useEffect, useState } from 'react';
import './ErrorPopup.css';

interface ErrorPopupProps {
  error: string | null; // Error message to display
  onClose: () => void; // Callback to remove the error after timeout
}

const ErrorPopup: React.FC<ErrorPopupProps> = ({ error, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Automatically close the popup after 5 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, 5000);

    // Cleanup the timer when the component unmounts
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible || !error) {
    return null; // Don't render anything if the popup is not visible or there is no error
  }

  return (
    <div className="error-popup">
      <p>{error}</p>
    </div>
  );
};

export default ErrorPopup;
