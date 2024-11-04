// AuthContext.tsx
import React from 'react';

interface AuthContextProps {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
}

const AuthContext = React.createContext<AuthContextProps>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  username: '',
  setUsername: () => {},
});

export default AuthContext;
