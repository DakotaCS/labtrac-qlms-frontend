// ./src/App.tsx

import React, { useContext } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext'; // Import AuthContext
import LoginPage from './pages/loginPage/loginPage';
import LandingPage from './pages/landingPage/landingPage';
import LocationPage from './pages/locationPage/locationPage';
import CategoryPage from './pages/categoryPage/categoryPage';
import UserManagementPage from './pages/userManagementPage/userManagementPage';
import Logout from './components/Logout';

// Import the new components
import SolidChemicalInventoryPage from './pages/solidInventoryItemPage/solidInventoryItemPage';
import InventoryItemDetailsPage from './pages/solidInventoryItemPage/inventoryItemDetailsPage/inventoryItemDetailsPage';

function App() {
  const { isAuthenticated } = useContext(AuthContext); // Use the authentication context

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/landing"
        element={
          isAuthenticated ? <LandingPage /> : <Navigate to="/login" replace />
        }
      />

      {/* Location Route */}
      <Route
        path="/location"
        element={
          isAuthenticated ? <LocationPage /> : <Navigate to="/login" replace />
        }
      />

      {/* Category Route */}
      <Route
        path="/category"
        element={
          isAuthenticated ? <CategoryPage /> : <Navigate to="/login" replace />
        }
      />

      {/* User Management Route */}
      <Route
        path="/user"
        element={
          isAuthenticated ? <UserManagementPage /> : <Navigate to="/login" replace />
        }
      />

      {/* Logout Route */}
      <Route
        path="/logout"
        element={
          isAuthenticated ? <Logout /> : <Navigate to="/login" replace />
        }
      />

      {/* Solid Chemical Inventory Route */}
      <Route
        path="/inventory/solid"
        element={
          isAuthenticated ? (
            <SolidChemicalInventoryPage />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Inventory Item Details Route */}
      <Route
        path="/inventory/solid/:id"
        element={
          isAuthenticated ? (
            <InventoryItemDetailsPage />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Default route */}
      <Route
        path="/"
        element={<Navigate to={isAuthenticated ? '/landing' : '/login'} replace />}
      />
    </Routes>
  );
}

export default App;
