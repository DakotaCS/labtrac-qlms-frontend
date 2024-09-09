import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './sideMenu.css';

interface MenuItem {
  id: number;
  name: string;
  url: string;
}

const SideMenu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = parseJwt(token).userId;

    axios
      .get(`https://backend.labtrac.quantuslms.ca/api/system/menu/${userId}`)
      .then(response => setMenuItems(response.data))
      .catch(error => console.error('Error fetching menu items:', error));
  }, []);

  // Function to parse JWT token
  const parseJwt = (token: string | null) => {
    if (!token) return {};
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return {};
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleMenu = () => {
    setCollapsed(!collapsed);
    
    // Dynamically adjust the layout based on menu state
    const layoutElement = document.querySelector('.layout') as HTMLElement;
    if (collapsed) {
      layoutElement.style.marginLeft = '250px'; // Expanded width
    } else {
      layoutElement.style.marginLeft = '60px'; // Collapsed width
    }
  };

  return (
    <>
      <button className="hamburger-icon" onClick={toggleMenu}>
        ☰
      </button>
      <div className={`side-menu ${collapsed ? 'collapsed' : ''}`}>
        <ul>
          {menuItems.map(item => (
            <li key={item.id}>
              <Link to={item.url}>{item.name}</Link>
            </li>
          ))}
          <li className="logout-button" onClick={handleLogout}>
            Logout
          </li>
        </ul>
      </div>
    </>
  );
};

export default SideMenu;
