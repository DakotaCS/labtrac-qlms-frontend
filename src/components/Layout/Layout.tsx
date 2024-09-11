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

  const handleMenuToggle = () => {
    setCollapsed(!collapsed);
  };

  return (
    <>
      <Header />
      <div className={`layout ${collapsed ? 'collapsed' : ''}`}>
        <SideMenu onToggle={handleMenuToggle} /> {/* Pass the handleMenuToggle function */}
        <div className="layout-content">
          <div className={`content ${collapsed ? 'collapsed' : ''}`}>
            {children}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Layout;
