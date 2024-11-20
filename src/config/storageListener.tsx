/**
 * @author Dakota Soares
 * @version 1.1
 * @description Storage Listener
 */

import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from './authContext';
import AutoLogoutManager from '../config/autoLogoutManager';
import { useScanning } from './scanningContext';

const StorageListener: React.FC = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated, setUsername } = useContext(AuthContext);
  const { disableScanning } = useScanning();

    /**
   * When called, do the following:
   * 1. Clear the auto logout timeout from the manager
   * 2. Remove storage cache from browser
   * 3. Add a logout item to the storage cache
   *  for the tab storage listener
   * 4. Disable Scanning for URLs
   * 5. Set isAuth to false for the auth context
   * 6. Redirect to the login page
   */
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'logout') {

        AutoLogoutManager.clearTimeout();
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('logout');
        setUsername('');
        disableScanning();
        setIsAuthenticated(false);
        
        navigate('/login');
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [navigate, setIsAuthenticated, setUsername, disableScanning]);

  return null;
};

export default StorageListener;
