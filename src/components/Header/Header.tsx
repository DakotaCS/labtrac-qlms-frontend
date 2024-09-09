import React from 'react';
import logo from '../../assets/logo.png'; // Assuming logo is in assets folder
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <img src={logo} alt="Logo" className="header-logo" />
      <h1 className="header-title">LabTrac Inventory Management System</h1>
    </header>
  );
};

export default Header;
