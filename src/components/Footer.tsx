// ./components/Footer.tsx

import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer style={footerStyle}>
      <p>&copy; 2024 Quantus Engineering</p>
    </footer>
  );
};

const footerStyle = {
  backgroundColor: '#282c34',
  padding: '10px',
  color: 'white',
  textAlign: 'center' as const,
  position: 'fixed' as const,
  bottom: 0,
  width: '100%',
};

export default Footer;
