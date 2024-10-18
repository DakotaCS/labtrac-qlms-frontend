// src/components/Logout.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AutoLogoutManager from '../utils/autoLogoutManager';

const Logout: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear the auto-logout timeout
    AutoLogoutManager.clearTimeout();

    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');

    // Redirect to login page
    navigate('/login');
  }, [navigate]);

  return (
    <div>
      <p>Logging out...</p>
    </div>
  );
};

export default Logout;
