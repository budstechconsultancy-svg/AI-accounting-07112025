import React from 'react';
import type { Page } from '../types';
import Icon from './Icon';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  companyName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, onLogout, companyName }) => {
  const navItems: { name: Page; icon: React.ReactElement }[] = [
    { name: 'Dashboard', icon: <Icon name="dashboard" /> },
    { name: 'Masters', icon: <Icon name="masters" /> },
    { name: 'Inventory', icon: <Icon name="inventory" /> },
    { name: 'Vouchers', icon: <Icon name="vouchers" /> },
    { name: 'Reports', icon: <Icon name="reports" /> },
    { name: 'Settings', icon: <Icon name="settings" /> },
  ];

  return (
    <aside className="w-64 bg-white text-gray-800 flex flex-col fixed h-full border-r border-slate-200">
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <h1 className="text-xl font-bold text-blue-600 truncate" title={companyName}>{companyName || 'AI-Accounting'}</h1>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => {
          const isActive = currentPage === item.name;
          return (
            <a
              key={item.name}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onNavigate(item.name);
              }}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-slate-100 hover:text-gray-900'
              }`}
            >
              <span className={`w-6 h-6 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>{item.icon}</span>
              <span>{item.name}</span>
            </a>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-slate-200">
         <a
            href="#"
            onClick={(e) => {
            e.preventDefault();
            onLogout();
            }}
            className="flex items-center space-x-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors text-gray-600 hover:bg-slate-100 hover:text-gray-900"
        >
            <Icon name="logout" className="w-6 h-6 text-gray-400" />
            <span>Logout</span>
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;