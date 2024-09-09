// ./src/components/SideMenu.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './sideMenu.css';

interface MenuItem {
  id: number;
  name: string;
  url: string;
}

const SideMenu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = parseJwt(token).userId;

    axios
      .get(`/getMenuItems/${userId}`)
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

  return (
    <div className="side-menu">
      <ul>
        {menuItems.map(item => (
          <li key={item.id}>
            <Link to={item.url}>{item.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SideMenu;
