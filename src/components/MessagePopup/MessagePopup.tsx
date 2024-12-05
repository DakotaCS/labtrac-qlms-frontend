/**
 * @author Dakota Soares
 * @version 1.1
 * @description Message Popup Component
 */

import React, { useEffect, useState } from 'react';
import './MessagePopup.css';

interface MessagePopupProps {
  message: string | null;
  onClose: () => void;
}

const MessagePopup: React.FC<MessagePopupProps> = ({ message, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible || !message) {
    return null;
  }

  return (
    <div className="message-popup">
      <p>{message}</p>
    </div>
  );
};

export default MessagePopup;
