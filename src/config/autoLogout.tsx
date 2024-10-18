// src/components/AutoLogout.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isTokenExpired, decodeJwt } from '../utils/jwtUtils';
import AutoLogoutManager from '../utils/autoLogoutManager';

const AutoLogout: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      const decodedToken = decodeJwt(token);

      if (decodedToken && !isTokenExpired(token)) {
        const currentTime = Date.now() / 1000;
        const timeUntilExpiration = (decodedToken.exp - currentTime) * 1000;

        // Clear any existing timeout
        AutoLogoutManager.clearTimeout();

        // Set a timeout to auto-logout the user when the token expires
        const timeoutId = setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          navigate('/login'); // Redirect to login page when token expires
        }, timeUntilExpiration);

        AutoLogoutManager.setTimeoutId(timeoutId);
      } else {
        // If the token is already expired, log the user out immediately
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login');
      }
    }

    // Cleanup function to clear the timeout when the component unmounts or when the effect re-runs
    return () => {
      AutoLogoutManager.clearTimeout();
    };
  }, [navigate]);

  return null;
};

export default AutoLogout;
