// src/components/Logout.tsx

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
    disableScanning(); // Disable scanning upon logout
    setIsAuthenticated(false);

    navigate('/login');
  }, [navigate, disableScanning, setIsAuthenticated]);

  return (
    <div>
      <p>Logging out...</p>
    </div>
  );
};

export default Logout;