import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import TrainerPortal from './components/TrainerPortal';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    // Restore admin auth state on page refresh
    return sessionStorage.getItem('admin_authenticated') === 'true';
  });

  useEffect(() => {
    sessionStorage.setItem('admin_authenticated', isAdminAuthenticated);
  }, [isAdminAuthenticated]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-900 selection:text-white">
      {/* Top Header Navigation */}
      <Header
        isAdminAuthenticated={isAdminAuthenticated}
        setIsAdminAuthenticated={setIsAdminAuthenticated}
      />

      {/* Main Content Router */}
      <main className="flex-1 pb-16">
        <Routes>
          {/* Trainer Portal Route */}
          <Route path="/" element={<TrainerPortal />} />

          {/* Admin Dashboard Route */}
          <Route
            path="/admin"
            element={
              isAdminAuthenticated ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Catch-all Route redirecting to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Modern Uncluttered Footer */}
      <footer className="py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} Trainer Attendance Tracker. All rights reserved.</p>
      </footer>
    </div>
  );
}
