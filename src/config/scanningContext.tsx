/**
 * @author Dakota Soares
 * @version 1.1
 * @description Scanning Context
 */

import React, { createContext, useState, useContext, useEffect  } from 'react';
import AuthContext from './authContext';

interface ScanningContextProps {
  isScanningEnabled: boolean;
  enableScanning: () => void;
  disableScanning: () => void;
}

const ScanningContext = createContext<ScanningContextProps>({
  isScanningEnabled: false,
  enableScanning: () => {},
  disableScanning: () => {},
});

export const ScanningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [isScanningEnabled, setIsScanningEnabled] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated) {
      setIsScanningEnabled(true);
    } else {
      setIsScanningEnabled(false);
    }
  }, [isAuthenticated]);

  const enableScanning = () => setIsScanningEnabled(true);
  const disableScanning = () => setIsScanningEnabled(false);

  return (
    <ScanningContext.Provider value={{ isScanningEnabled, enableScanning, disableScanning }}>
      {children}
    </ScanningContext.Provider>
  );
};

export const useScanning = () => useContext(ScanningContext);
export default ScanningContext;
