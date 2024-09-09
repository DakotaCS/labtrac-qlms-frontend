import React from 'react';
import Header from './Header/Header';
import Footer from './Footer';
import SideMenu from './sideMenu';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Header />
      <div className="layout">
        <div className="layout-content">
          <SideMenu />
          <div className="content">{children}</div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Layout;
