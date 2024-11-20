/**
 * @author Dakota Soares
 * @version 1.1
 * @description User Management Page
 */

import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AutoLogoutManager from '../config/autoLogoutManager';
import AuthContext from '../config/authContext';
import { useScanning } from '../config/ScanningContext';

const Logout: React.FC = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useContext(AuthContext);
  const { disableScanning } = useScanning();
 
  /**
   * When called, do the following:
   * 1. Clear the auto logout timeout from the manager
   * 2. Remove storage cache from browser
   * 3. Disable Scanning for URLs
   * 4. Set isAuth to false for the auth context
   * 5. Redirect to the login page
   */
  useEffect(() => {
    AutoLogoutManager.clearTimeout();
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    disableScanning();
    setIsAuthenticated(false);

    navigate('/login');
  }, [navigate, disableScanning, setIsAuthenticated]);

  return null;
};

export default Logout;