/**
 * @author Dakota Soares
 * @version 1.1
 * @description Handles Logout Operations
 */

import { useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from './authContext';
import AutoLogoutManager from './autoLogoutManager';
import { useScanning } from './scanningContext';

    /**
    * Custom Hook to handle user logout. 
    * When called, do the following:
   * 1. Clear the auto logout timeout from the manager
   * 2. Remove storage cache from browser
   * 3. Disable Scanning for URLs
   * 4. Set isAuth to false for the auth context
   * 5. Redirect to the login page
   */
const LogoutHelper = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated, setUsername } = useContext(AuthContext);
  const { disableScanning } = useScanning();
  const LogoutHelper = useCallback(() => {

    AutoLogoutManager.clearTimeout();
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    setUsername('');
    disableScanning();
    setIsAuthenticated(false);

    navigate('/login');
  }, [navigate, setIsAuthenticated, setUsername, disableScanning]);

  return LogoutHelper;
};

export default LogoutHelper;
