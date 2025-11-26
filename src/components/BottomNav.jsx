// src/components/BottomNav.jsx
import React from 'react';
import { useLocation, Link } from 'react-router-dom'; // ← importe Link

const BottomNav = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/resumo', label: 'Resumo', icon: '📊' },
    { path: '/despesas', label: 'Despesas', icon: '💸' },
    { path: '/rendas', label: 'Rendas', icon: '💰' },
    { path: '/colaboradores', label: 'Família', icon: '👥' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
      <div className="grid grid-cols-4 py-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center text-xs ${
              isActive(item.path) ? 'text-blue-600' : 'text-gray-500'
            }`}
          >
            <span className="text-lg mb-1">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;