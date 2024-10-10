import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './pages/loginPage/loginPage';
import LandingPage from './pages/landingPage/landingPage';
import LocationPage from './pages/locationPage/locationPage';
import CategoryPage from './pages/categoryPage/categoryPage';
import UserManagementPage from './pages/userManagementPage/userManagementPage';
import Logout from './components/Logout';
import { isTokenExpired, decodeJwt } from './utils/jwtUtils';

// **Import the new components**
import SolidChemicalInventoryPage from './pages/solidInventoryItemPage/solidInventoryItemPage';
import InventoryItemDetailsPage from './pages/inventoryItemDetailsPage/inventoryItemDetailsPage';

// Component to handle auto-logout functionality
const AutoLogout: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      const decodedToken = decodeJwt(token);

      if (decodedToken && !isTokenExpired(token)) {
        const currentTime = Date.now() / 1000;
        const timeUntilExpiration = (decodedToken.exp - currentTime) * 1000;

        // Set a timeout to auto-logout the user when the token expires
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          navigate('/login'); // Redirect to login page when token expires
        }, timeUntilExpiration);
      } else {
        // If the token is already expired, log the user out immediately
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login');
      }
    }
  }, [navigate]);

  return null; // This component doesn't render anything, just handles the auto-logout logic
};

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

        {/* **Add the Solid Chemical Inventory Route** */}
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

        {/* **Add the Inventory Item Details Route** */}
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
