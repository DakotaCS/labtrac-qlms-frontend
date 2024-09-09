import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from './pages/loginPage/loginPage';
import LandingPage from './pages/landingPage/landingPage';
import Layout from './components/Layout/Layout';
import Logout from './components/Logout'; // Import the Logout component

function App() {
  const isAuthenticated = !!localStorage.getItem('token'); // Check if the user is authenticated

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/landing"
          element={
            isAuthenticated ? (
              <Layout>
                <LandingPage />
              </Layout>
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
        {/* Default route */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/landing" : "/login"} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
