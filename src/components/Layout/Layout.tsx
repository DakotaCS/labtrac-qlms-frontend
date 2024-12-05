/**
 * @author Dakota Soares
 * @version 1.1
 * @description Layout Component
 */

import React, { useState } from 'react';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import SideMenu from '../SideMenu/sideMenu';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleMenu = () => {
    setCollapsed(!collapsed);
  };

  return (
    <>
      <Header />
      <div className={collapsed ? 'layout layout-collapsed' : 'layout layout-expanded'}>
        <SideMenu onToggle={toggleMenu} />
        <div className="layout-content">
          {children}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Layout;
