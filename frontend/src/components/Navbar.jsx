import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Home, Layers, Activity } from 'lucide-react';

function Navbar() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/bulk', label: 'Bulk Scan', icon: Layers },
    { path: '/dashboard', label: 'Dashboard', icon: Activity },
  ];

  return (
    <nav className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-500/30 group-hover:bg-blue-500 transition-colors">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                PhishNet
              </span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-slate-700 text-blue-400 shadow-inner border border-slate-600' 
                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
