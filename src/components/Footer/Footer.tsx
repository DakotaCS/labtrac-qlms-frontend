import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import './Footer.css'; // Import the CSS file

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <Link to="/logout" className="logout-link">Logout</Link>
        <p className="footer-text">&copy; 2024 Quantus Engineering</p>
      </div>
    </footer>
  );
};

export default Footer;
