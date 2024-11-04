// App.tsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/loginPage/loginPage';
import LandingPage from './pages/landingPage/landingPage';
import LocationPage from './pages/system/locationPage/locationPage';
import CategoryPage from './pages/system/categoryPage/categoryPage';
import UserManagementPage from './pages/system/userManagementPage/userManagementPage';
import Logout from './pages/Logout';
import AutoLogout from './config/autoLogout';
import SolidChemicalInventoryPage from './pages/inventory/solidInventoryItemPage/solidInventoryItemPage';
import InventoryItemDetailsPage from './pages/inventory/solidInventoryItemPage/inventoryItemDetailsPage/inventoryItemDetailsPage';
import DeviceConfigurationPage from './pages/system/deviceConfigurationPage/deviceConfigurationPage';
import AuthContext from './config/authContext';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username') || '');


  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, username, setUsername }}>
    <Router>
      <AutoLogout /> {}
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/landing" element={isAuthenticated ? <LandingPage /> : <Navigate to="/login" />} />

        {/* Location Route */}
        <Route path="/location" element={isAuthenticated ? <LocationPage /> : <Navigate to="/login" />} />

        {/* Category Route */}
        <Route path="/category" element={isAuthenticated ? <CategoryPage /> : <Navigate to="/login" />}/>

        {/* User Management Route */}
        <Route path="/user" element={isAuthenticated ? <UserManagementPage /> : <Navigate to="/login" />}/>

        {/* Device Configuration Route */}
        <Route path="/device-configuration" element={isAuthenticated ? <DeviceConfigurationPage /> : <Navigate to="/login" />}/>

        {/* Logout Route */}
        <Route path="/logout" element={isAuthenticated ? <Logout /> : <Navigate to="/login" />}/>

        {/* Solid Chemical Inventory Route */}
        <Route path="/inventory/solid" element={isAuthenticated ? <SolidChemicalInventoryPage /> : <Navigate to="/login" />}/>

        {/* Inventory Item Details Route */}
        <Route path="/inventory/solid/:id" element={isAuthenticated ? <InventoryItemDetailsPage /> : <Navigate to="/login" />}/>

        {/* Default route */}
        <Route path="/" element={<Navigate to={isAuthenticated ? '/landing' : '/login'} />}
        />
      </Routes>
    </Router>
    </AuthContext.Provider>
  );
}

export default App;
