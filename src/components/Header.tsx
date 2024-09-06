// ./components/Header.tsx

import React from 'react';
import logo from '../assets/headerLogo.png';  // Import the logo

const Header: React.FC = () => {
  return (
    <header style={{ backgroundColor: '#282c34', padding: '10px 20px', color: 'white' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img 
          src={logo} 
          alt="Logo" 
          style={{ width: '50px', height: 'auto', marginRight: '15px' }}  // Adjust the logo size
        />
        <h1 style={{ fontSize: '1.5rem', margin: 0, textAlign: 'left' }}>
          LabTrac Inventory Management System
        </h1>
      </div>
    </header>
  );
};

export default Header;
