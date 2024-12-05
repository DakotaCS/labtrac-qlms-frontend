/**
 * @author Dakota Soares
 * @version 1.1
 * @description Auto Logout
 */

import React, { useEffect } from 'react';
import { isTokenExpired, decodeJwt } from '../utils/jwtUtils';
import AutoLogoutManager from './autoLogoutManager';
import LogoutHelper from './logoutHelper';

const AutoLogout: React.FC = () => {
  const logout = LogoutHelper();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      const decodedToken = decodeJwt(token);

      if (decodedToken && !isTokenExpired(token)) {
        const currentTime = Date.now() / 1000;
        const timeUntilExpiration = (decodedToken.exp - currentTime) * 1000;

        AutoLogoutManager.clearTimeout();

        const timeoutId = setTimeout(() => {
          logout();
          localStorage.setItem('logout', Date.now().toString());
        }, timeUntilExpiration);

        AutoLogoutManager.setTimeoutId(timeoutId);
      } else {
        logout();
        localStorage.setItem('logout', Date.now().toString());
      }
    }

    return () => {
      AutoLogoutManager.clearTimeout();
    };
  }, [logout]);

  return null;
};

export default AutoLogout;
