import React, { useState } from 'react';
import { Lock, KeyRound, X, AlertCircle } from 'lucide-react';

export default function AdminAuthModal({ isOpen, onClose, onSuccess }) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    // Default Admin Passcode: admin123
    if (passcode.trim() === 'admin123') {
      setError('');
      setPasscode('');
      onSuccess();
    } else {
      setError('Invalid Admin Passcode.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 bg-blue-50 text-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <Lock className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-blue-900 text-center mb-1">
          Admin Access Required
        </h3>
        <p className="text-xs text-slate-500 text-center mb-6">
          Trainers cannot view admin logs. Please enter the Admin Passcode to continue.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Admin Passcode
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="Enter passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                autoFocus
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-sm rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-blue-900 hover:bg-blue-950 text-white font-semibold text-sm rounded-xl shadow-md transition-all"
            >
              Authenticate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
