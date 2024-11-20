/**
 * @author Dakota Soares
 * @version 1.1
 * @description User Management Page
 */

import React, { useEffect } from 'react';
import LogoutHelper from '../config/logoutHelper';

const Logout: React.FC = () => {
  const logout = LogoutHelper();
 
  useEffect(() => {
    logout();
    localStorage.setItem('logout', Date.now().toString());
  }, [logout]);

  return null;
};

export default Logout;