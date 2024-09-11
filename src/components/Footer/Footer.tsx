import React from 'react';
import './Footer.css'; // Import the CSS file

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <p className="footer-text">&copy; 2024 Quantus Engineering</p> {/* Apply the footer-text class */}
    </footer>
  );
};

export default Footer;
