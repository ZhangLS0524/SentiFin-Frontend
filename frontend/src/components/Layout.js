import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../styles/Layout.css';

const Layout = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const handleSidebarToggle = (expanded) => {
    setSidebarExpanded(expanded);
  };

  return (
    <div className="layout">
      <Sidebar onToggle={handleSidebarToggle} />
      <main className={sidebarExpanded ? '' : 'sidebar-collapsed'}>
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout; 