import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserCheck, LayoutDashboard, Lock, LogOut } from 'lucide-react';
import AdminAuthModal from './AdminAuthModal';
import orokiLogo from '../assets/oroki-hub-logo.jpg';

export default function Header({ isAdminAuthenticated, setIsAdminAuthenticated }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleAdminTabClick = (e) => {
    e.preventDefault();
    if (isAdminAuthenticated) {
      navigate('/admin');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    setIsAdminAuthenticated(true);
    setIsAuthModalOpen(false);
    navigate('/admin');
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    navigate('/');
  };

  return (
    <header className="w-full bg-white border-b border-slate-200 shadow-sm py-6 px-4 mb-8">
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center">
        {/* Company Logo */}
        <div className="mb-4 flex justify-center">
          <img
            src={orokiLogo}
            alt="ÒRÒKÍ HUB Logo"
            className="h-16 md:h-20 w-auto object-contain rounded-xl shadow-md transition-all hover:scale-105 hover:shadow-lg cursor-pointer"
            onClick={() => navigate('/')}
            id="company-logo"
          />
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-blue-900 tracking-tight text-center">
          Trainer Attendance Tracker
        </h1>
        <p className="text-sm text-slate-500 mt-1 text-center">
          Streamlined check-in, admin approval, and activity logging
        </p>

        {/* View Switcher Tabs with React Router NavLink */}
        <div className="mt-6 flex items-center gap-3">
          <nav className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-inner">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-blue-900 hover:bg-slate-200/60'
                }`
              }
            >
              <UserCheck className="w-4 h-4" />
              Trainer Portal
            </NavLink>

            <NavLink
              to="/admin"
              onClick={handleAdminTabClick}
              className={({ isActive }) =>
                `flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-blue-900 hover:bg-slate-200/60'
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Admin Dashboard</span>
              {!isAdminAuthenticated && (
                <Lock className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              )}
            </NavLink>
          </nav>

          {/* Admin Logout Button */}
          {isAdminAuthenticated && (
            <button
              onClick={handleAdminLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl transition-all"
              title="Lock Admin Access"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Passcode Modal */}
      <AdminAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </header>
  );
}
