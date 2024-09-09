// ./src/components/Layout.tsx

import React from 'react';
import Header from './Header';
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
        <SideMenu />
        <div className="content">{children}</div>
      </div>
      <Footer />
    </>
  );
};

export default Layout;
