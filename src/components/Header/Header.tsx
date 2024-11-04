import React from 'react';
import logo from '../../assets/logo.png';
import './Header.css';
import profilePic from '../../assets/icons/profile.png';

const Header: React.FC = () => {
  const username = localStorage.getItem('userName');

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
              <a href="/logout">Logout</a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
