// ./src/components/SideMenu/SideMenu.tsx

import React, { useEffect, useState } from 'react';
import apiClient from '../../config/axiosConfig'; // Import the configured Axios instance
import { Link } from 'react-router-dom';
import './sideMenu.css';

interface MenuItem {
  id: number;
  name: string;
  url: string;
  iconName: string | null;
  orderIndex: number;
  subOrderIndex: number | null;
}

interface SideMenuProps {
  onToggle: () => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ onToggle }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [expandedParents, setExpandedParents] = useState<number[]>([]);

  useEffect(() => {
    const userId = localStorage.getItem('userId');

    if (userId) {
      apiClient
        .get(`/system/user/${userId}/menu-items`)
        .then((response) => {
          const sortedItems = response.data.sort((a: MenuItem, b: MenuItem) => {
            if (a.orderIndex !== b.orderIndex) {
              return a.orderIndex - b.orderIndex;
            } else {
              return (a.subOrderIndex || 0) - (b.subOrderIndex || 0);
            }
          });
          setMenuItems(sortedItems);
        })
        .catch((error) => console.error('Error fetching menu items:', error));
    }
  }, []);

  const toggleMenu = () => {
    setCollapsed(!collapsed);
    onToggle();
    if (!collapsed) {
      setExpandedParents([]); // Collapse all sub-menus when menu is collapsed
    }
  };

  const toggleSubMenu = (parentId: number) => {
    if (collapsed) return; // Prevent submenu toggle when collapsed

    setExpandedParents((prevExpanded) =>
      prevExpanded.includes(parentId)
        ? prevExpanded.filter((id) => id !== parentId)
        : [...prevExpanded, parentId]
    );
  };

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
      <div className="menu-header">
        <button className="hamburger-icon" onClick={toggleMenu}>
          ☰
        </button>
        {!collapsed && <span className="menu-title">Menu</span>}
      </div>

      <ul>
        {menuItems.map((item) => {
          const isParent = menuItems.some(
            (subItem) =>
              subItem.orderIndex === item.orderIndex && subItem.subOrderIndex !== null
          );

          if (item.subOrderIndex === null) {
            return (
              <li key={item.id} className="menu-item-container">
                {isParent ? (
                  <div
                    className="menu-item parent-menu-item"
                    onClick={() => toggleSubMenu(item.id)}
                  >
                    <img
                      src={getIconPath(item.iconName)}
                      alt={item.name}
                      className="menu-icon"
                    />
                    {!collapsed && <span className="menu-text">{item.name}</span>}
                  </div>
                ) : (
                  <Link to={item.url} className="menu-item">
                    <img
                      src={getIconPath(item.iconName)}
                      alt={item.name}
                      className="menu-icon"
                    />
                    {!collapsed && <span className="menu-text">{item.name}</span>}
                  </Link>
                )}

                <ul
                  className={`submenu ${
                    expandedParents.includes(item.id) ? 'expanded' : ''
                  }`}
                >
                  {expandedParents.includes(item.id) &&
                    menuItems
                      .filter(
                        (subItem) =>
                          subItem.orderIndex === item.orderIndex &&
                          subItem.subOrderIndex !== null
                      )
                      .map((subItem) => (
                        <li key={subItem.id} className="submenu-item">
                          <Link to={subItem.url} className="menu-item submenu-text">
                            {!collapsed && (
                              <>
                                <img
                                  src={getIconPath(subItem.iconName)}
                                  alt={subItem.name}
                                  className="menu-icon"
                                />
                                <span>{subItem.name}</span>
                              </>
                            )}
                          </Link>
                        </li>
                      ))}
                </ul>
              </li>
            );
          }
          return null;
        })}
      </ul>
    </div>
  );
};

export default SideMenu;
