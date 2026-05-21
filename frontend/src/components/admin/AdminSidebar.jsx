import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, Package, Users, ShoppingBag, LayoutDashboard } from 'lucide-react';

export const AdminSidebar = () => {
  const links = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Users', path: '/admin/users', icon: Users },
  ];

  return (
    <aside className="w-full md:w-64 glass-panel rounded-2xl p-4 md:sticky md:top-20 h-fit space-y-4">
      <div className="px-3 py-2 border-b border-white/5">
        <h2 className="text-xs uppercase tracking-wider font-bold text-slate-400">Admin Control Panel</h2>
      </div>
      <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-1.5 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-md shadow-primary/20'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`
              }
            >
              <Icon className="h-4.5 w-4.5" />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
