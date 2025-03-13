import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Package, ShoppingCart, BarChart2, Settings, Home } from 'lucide-react';
import { translations } from '../translations';

const Layout: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-800 text-white">
        <div className="p-4 flex items-center space-x-2">
          <Package size={24} />
          <h1 className="text-xl font-bold">{translations.appTitle}</h1>
        </div>
        <nav className="mt-8">
          <ul>
            <li>
              <Link 
                to="/" 
                className={`flex items-center space-x-2 p-4 hover:bg-blue-700 ${isActive('/')}`}
              >
                <Home size={20} />
                <span>{translations.dashboard}</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/products" 
                className={`flex items-center space-x-2 p-4 hover:bg-blue-700 ${isActive('/products')}`}
              >
                <Package size={20} />
                <span>{translations.products}</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/sales" 
                className={`flex items-center space-x-2 p-4 hover:bg-blue-700 ${isActive('/sales')}`}
              >
                <ShoppingCart size={20} />
                <span>{translations.sales}</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/reports" 
                className={`flex items-center space-x-2 p-4 hover:bg-blue-700 ${isActive('/reports')}`}
              >
                <BarChart2 size={20} />
                <span>{translations.reports}</span>
              </Link>
            </li>
            <li>
              <Link 
                to="/settings" 
                className={`flex items-center space-x-2 p-4 hover:bg-blue-700 ${isActive('/settings')}`}
              >
                <Settings size={20} />
                <span>{translations.settings}</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {location.pathname === '/' && translations.dashboard}
              {location.pathname === '/products' && translations.products}
              {location.pathname === '/sales' && translations.sales}
              {location.pathname === '/reports' && translations.reports}
              {location.pathname === '/settings' && translations.settings}
            </h2>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;