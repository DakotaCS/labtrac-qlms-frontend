/**
 * @author Dakota Soares
 * @version 1.1
 * @description Footer Component
 */

import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-text">&copy; 2025 DKS Technical Solutions</p>
      </div>
    </footer>
  );
};

export default Footer;
