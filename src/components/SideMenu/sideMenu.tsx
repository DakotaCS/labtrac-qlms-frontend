import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './sideMenu.css';

interface MenuItem {
  id: number;
  name: string;
  url: string;
  iconName: string | null; // Icon name coming from the API
}

const SideMenu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [collapsed, setCollapsed] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId'); // Retrieve user ID from localStorage

    if (token && userId) {
      axios
        .get(`https://backend.labtrac.quantuslms.ca/api/system/user/${userId}/menu-items`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(response => setMenuItems(response.data))
        .catch(error => console.error('Error fetching menu items:', error));
    }
  }, []);

  const toggleMenu = () => {
    setCollapsed(!collapsed);
  };

  // Dynamically require icons from assets/icons directory
  const getIconPath = (iconName: string | null) => {
    try {
      return require(`../../assets/icons/${iconName}.png`);
    } catch (error) {
      console.error(`Icon not found: ${iconName}`);
      return require(`../../assets/icons/default.png`);
    }
  };

  return (
    <div className={`side-menu ${collapsed ? 'collapsed' : ''}`}>
      {/* Hamburger icon and Menu title */}
      <div className="menu-header">
        <button className="hamburger-icon" onClick={toggleMenu}>
          ☰
        </button>
        {!collapsed && <span className="menu-title">Menu</span>}
      </div>
      
      {/* Menu items */}
      <ul>
        {menuItems.map(item => (
          <li key={item.id}>
            <Link to={item.url} className="menu-item">
              <img src={getIconPath(item.iconName)} alt={item.name} className="menu-icon" />
              {!collapsed && <span className="menu-text">{item.name}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SideMenu;
