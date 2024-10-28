// src/components/AutoLogout.tsx
import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { isTokenExpired, decodeJwt } from '../utils/jwtUtils';
import AutoLogoutManager from '../utils/autoLogoutManager';
import AuthContext from '../utils/authContext';

const AutoLogout: React.FC = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      const decodedToken = decodeJwt(token);

      if (decodedToken && !isTokenExpired(token)) {
        const currentTime = Date.now() / 1000;
        const timeUntilExpiration = (decodedToken.exp - currentTime) * 1000;

        AutoLogoutManager.clearTimeout();

        const timeoutId = setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          setIsAuthenticated(false);
          navigate('/login');
        }, timeUntilExpiration);

        AutoLogoutManager.setTimeoutId(timeoutId);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setIsAuthenticated(false); 
        navigate('/login');
      }
    }

    return () => {
      AutoLogoutManager.clearTimeout();
    };
  }, [navigate, setIsAuthenticated]);

  return null;
};

export default AutoLogout;
