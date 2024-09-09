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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const toggleMenu = () => {
    setCollapsed(!collapsed);
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
