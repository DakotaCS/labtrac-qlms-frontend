/**
 * @author Dakota Soares
 * @version 1.1
 * @description Storage Listener
 */

import { useEffect } from 'react';
import LogoutHelper from './logoutHelper';

const StorageListener: React.FC = () => {
  const logout = LogoutHelper();

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'logout') {
        logout();
        localStorage.removeItem('logout');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [logout]);

  return null;
};

export default StorageListener;
