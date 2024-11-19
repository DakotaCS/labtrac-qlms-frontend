import React from 'react';
import { Link } from 'react-router-dom';
import { useScanning } from '../../config/ScanningContext';
import './Header.css';
import logo from '../../assets/logo.png';
import profilePic from '../../assets/icons/profile.png';

const Header: React.FC = () => {
  const username = localStorage.getItem('userName');
  const { isScanningEnabled, enableScanning, disableScanning } = useScanning();

  const toggleScanning = () => {
    if (isScanningEnabled) {
      disableScanning();
    } else {
      enableScanning();
    }
  };

  return (
    <header className="header">
      <img src={logo} alt="Logo" className="header-logo" />
      <h1 className="header-title">LabTrac Inventory Management System</h1>
      {username && (
        <div className="header-user">
          <span>Welcome, {username}</span>
          <div className="profile-dropdown">
            <img src={profilePic} alt="Profile" className="profile-pic" />
            <div className="dropdown-content">
              <button
                type="button"
                onClick={toggleScanning}
                className="dropdown-button"
              >
                {isScanningEnabled ? 'Stop Scanning' : 'Start Scanning'}
              </button>
              <Link to="/logout" className="dropdown-button">
                Logout
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
