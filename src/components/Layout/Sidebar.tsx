import React from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  userRole: string;
}

interface NavItem {
  path: string;
  label: string;
  icon: string;
  roles: string[];
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['DGP', 'DIG', 'SP', 'CP', 'SDPO'] },
  { path: '/sdpos', label: 'SDPO Management', icon: '👮', roles: ['DGP', 'DIG', 'SP', 'CP'] },
  { path: '/analytics', label: 'Analytics', icon: '📈', roles: ['DGP', 'DIG', 'SP', 'CP'] },
  { path: '/reports', label: 'Reports', icon: '📋', roles: ['DGP', 'DIG', 'SP', 'CP', 'SDPO'] },
  { path: '/profile', label: 'Profile', icon: '👤', roles: ['DGP', 'DIG', 'SP', 'CP', 'SDPO'] },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, userRole }) => {
  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <div className={`fixed left-0 top-0 h-full bg-ap-blue-900 text-white transition-all duration-300 z-50 ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🛡️</div>
          {isOpen && (
            <div>
              <h1 className="text-lg font-bold">AP Police</h1>
              <p className="text-xs text-ap-blue-200">SDPO Dashboard</p>
            </div>
          )}
        </div>
      </div>

      <nav className="mt-8">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-white hover:bg-ap-blue-800 transition-colors ${
                isActive ? 'bg-ap-blue-800 border-r-4 border-ap-gold-400' : ''
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            {isOpen && <span className="ml-3">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {isOpen && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-ap-blue-800 rounded-lg p-3">
            <div className="text-sm">
              <div className="font-semibold">Role: {userRole}</div>
              <div className="text-ap-blue-200">Version 1.0</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
