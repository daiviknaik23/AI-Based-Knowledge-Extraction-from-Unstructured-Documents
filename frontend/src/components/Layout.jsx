import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50 dark:bg-surface-900 bg-grid-pattern">
      {/* Background orbs */}
      <div className="orb orb-primary w-96 h-96 -top-48 -left-48 fixed" />
      <div className="orb orb-accent w-72 h-72 top-1/2 -right-36 fixed" />
      <div className="orb orb-primary w-64 h-64 -bottom-32 left-1/3 fixed" />

      <Sidebar isOpen={sidebarOpen} toggle={() => setSidebarOpen(!sidebarOpen)} />

      <main
        className={`flex-1 overflow-y-auto transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
