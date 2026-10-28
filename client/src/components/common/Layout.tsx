import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar.js';
import { Sidebar } from './Sidebar.js';
import { useAuth } from '../../context/AuthContext.js';

export const Layout: React.FC = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <div className="flex flex-1">
        {user && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        <main className={`flex-1 flex flex-col transition-all duration-300 ${user ? 'lg:pl-64' : ''}`}>
          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>

          <footer className="border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-medium text-slate-700">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                <span>Connecting Tech &mdash; Naan Mudhalvan Alignment Initiative</span>
              </div>
              <p className="text-slate-400">
                &copy; {new Date().getFullYear()} Government of Tamil Nadu &middot; University-Industry Geofenced Network
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};
