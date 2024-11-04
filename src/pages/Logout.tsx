// src/components/Logout.tsx

import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AutoLogoutManager from '../config/autoLogoutManager';
import AuthContext from '../config/authContext';

const Logout: React.FC = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useContext(AuthContext);
 
  /**
   * When called, do the following:
   * 1. Clear the auto logout timeout from the manager
   * 2. Remove storage cache from browser
   * 3. Set isAuth to false for the auth context
   * 4. Redirect to the login page
   */
  useEffect(() => {
    AutoLogoutManager.clearTimeout();
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    setIsAuthenticated(false);

    navigate('/login');
  }, [navigate, setIsAuthenticated]);

  return (
    <div>
      <p>Logging out...</p>
    </div>
  );
};

export default Logout;