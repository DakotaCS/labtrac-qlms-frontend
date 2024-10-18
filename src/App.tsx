// App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/loginPage/loginPage';
import LandingPage from './pages/landingPage/landingPage';
import LocationPage from './pages/locationPage/locationPage';
import CategoryPage from './pages/categoryPage/categoryPage';
import UserManagementPage from './pages/userManagementPage/userManagementPage';
import Logout from './components/Logout';
import AutoLogout from './config/autoLogout'; // Import the AutoLogout component

// Import the new components
import SolidChemicalInventoryPage from './pages/solidInventoryItemPage/solidInventoryItemPage';
import InventoryItemDetailsPage from './pages/solidInventoryItemPage/inventoryItemDetailsPage/inventoryItemDetailsPage';

function App() {
  const isAuthenticated = !!localStorage.getItem('token'); // Check if the user is authenticated

  return (
    <Router>
      <AutoLogout /> {/* Add the AutoLogout component inside the Router */}
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/landing"
          element={
            isAuthenticated ? (
              <LandingPage />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Location Route */}
        <Route
          path="/location"
          element={
            isAuthenticated ? (
              <LocationPage />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Category Route */}
        <Route
          path="/category"
          element={
            isAuthenticated ? (
              <CategoryPage />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* User Management Route */}
        <Route
          path="/user"
          element={
            isAuthenticated ? (
              <UserManagementPage />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Logout Route */}
        <Route
          path="/logout"
          element={
            isAuthenticated ? (
              <Logout />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Solid Chemical Inventory Route */}
        <Route
          path="/inventory/solid"
          element={
            isAuthenticated ? (
              <SolidChemicalInventoryPage />
            ) : (
              <Navigate to="/login" />
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
              <Navigate to="/login" />
            )
          }
        />

        {/* Default route */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? '/landing' : '/login'} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
