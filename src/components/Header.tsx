import React from 'react';

const Header: React.FC = () => {
  return (
    <header style={headerStyle}>
      <h1>LabTrac Inventory Management System</h1>
    </header>
  );
};

const headerStyle = {
  backgroundColor: '#282c34',
  padding: '10px',
  color: 'white',
  textAlign: 'center' as const,
};

export default Header;