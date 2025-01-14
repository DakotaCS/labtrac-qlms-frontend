/**
 * @author Dakota Soares
 * @version 1.1
 * @description App
 */

import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/loginPage/loginPage';
import LandingPage from './pages/landingPage/landingPage';
import LocationPage from './pages/system/locationPage/locationPage';
import CategoryPage from './pages/system/categoryPage/categoryPage';
import UserManagementPage from './pages/system/userManagementPage/userManagementPage';
import Logout from './pages/logoutPage';
import AutoLogout from './config/autoLogout';
import SolidChemicalInventoryPage from './pages/inventory/solidInventoryItemPage/solidInventoryItemPage';
import SolidInventoryItemDetailsPage from './pages/inventory/solidInventoryItemPage/inventoryItemDetailsPage/solidInventoryItemDetailsPage';
import LiquidChemicalInventoryPage from './pages/inventory/liquidInventoryItemPage/liquidInventoryItemPage';
import LiquidInventoryItemDetailsPage from './pages/inventory/liquidInventoryItemPage/inventoryItemDetailsPage/liquidInventoryItemDetailsPage';
import UnclassifiedInventoryPage from './pages/inventory/unclassifiedInventoryPage/unclassifiedInventoryItemPage';
import DeviceConfigurationPage from './pages/system/deviceConfigurationPage/deviceConfigurationPage';
import UnitPage from './pages/system/unitPage/unitPage';
import AuthContext from './config/authContext';
import StorageListener from './config/storageListener';
import ScannerListener from './config/scannerListener';
import { ScanningProvider } from './config/scanningContext';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username') || '');


  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, username, setUsername }}>
          <ScanningProvider>

    <Router>
    <ScannerListener />
    <StorageListener />
      <AutoLogout /> {}
      <Routes>
        {/* Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Landing Route */}
        <Route path="/landing" element={isAuthenticated ? <LandingPage /> : <Navigate to="/login" />} />

        {/* Location Route */}
        <Route path="/location" element={isAuthenticated ? <LocationPage /> : <Navigate to="/login" />} />

        {/* Category Route */}
        <Route path="/category" element={isAuthenticated ? <CategoryPage /> : <Navigate to="/login" />}/>

        {/* User Management Route */}
        <Route path="/user" element={isAuthenticated ? <UserManagementPage /> : <Navigate to="/login" />}/>

        {/* Device Configuration Route */}
        <Route path="/device-configuration" element={isAuthenticated ? <DeviceConfigurationPage /> : <Navigate to="/login" />}/>

        {/* Unit Route */}
        <Route path="/unit" element={isAuthenticated ? <UnitPage /> : <Navigate to="/login" />}/>

        {/* Logout Route */}
        <Route path="/logout" element={isAuthenticated ? <Logout /> : <Navigate to="/login" />}/>

        {/* Solid Chemical Inventory Route */}
        <Route path="/inventory/solid" element={isAuthenticated ? <SolidChemicalInventoryPage /> : <Navigate to="/login" />}/>

        {/* Inventory Item Details Route */}
        <Route path="/inventory/solid/:id" element={isAuthenticated ? <SolidInventoryItemDetailsPage /> : <Navigate to="/login" />}/>
        
        {/* Liquid Chemical Inventory Route */}
        <Route path="/inventory/liquid" element={isAuthenticated ? <LiquidChemicalInventoryPage /> : <Navigate to="/login" />}/>

        {/* Inventory Item Details Route */}
        <Route path="/inventory/liquid/:id" element={isAuthenticated ? <LiquidInventoryItemDetailsPage /> : <Navigate to="/login" />}/>

        {/* Unclassified Chemical Inventory Route */}
        <Route path="/inventory/unclassified" element={isAuthenticated ? <UnclassifiedInventoryPage /> : <Navigate to="/login" />}/>

        {/* Default route */}
        <Route path="/" element={<Navigate to={isAuthenticated ? '/landing' : '/login'} />}
        />
      </Routes>
    </Router>
    </ScanningProvider>
    </AuthContext.Provider>
  );
}

export default App;
