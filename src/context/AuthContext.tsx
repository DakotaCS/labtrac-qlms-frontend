import React, { createContext, useState, useEffect } from 'react';
import { decodeJwt, isTokenExpired } from '../utils/jwtUtils';
import { useNavigate } from 'react-router-dom';

interface AuthContextProps {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AuthContext = createContext<AuthContextProps>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token && !isTokenExpired(token)) {
      setIsAuthenticated(true);

      const decodedToken = decodeJwt(token);
      const currentTime = Date.now() / 1000;
      const timeUntilExpiration = (decodedToken.exp - currentTime) * 1000;

      // Set a timeout to auto-logout the user when the token expires
      const timeoutId = setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setIsAuthenticated(false);
        navigate('/login');
      }, timeUntilExpiration);

      return () => clearTimeout(timeoutId);
    } else {
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    }
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
