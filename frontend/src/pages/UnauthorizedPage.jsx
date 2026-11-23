import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ShieldAlert, ArrowLeft, LogOut, Home } from 'lucide-react';

export const UnauthorizedPage = () => {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleGoDashboard = () => {
    if (role === 'STUDENT') {
      navigate('/student/dashboard');
    } else if (role === 'FACULTY') {
      navigate('/faculty/dashboard');
    } else {
      navigate('/login');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
          Access Restricted • 403 Forbidden
        </span>

        <h1 className="text-2xl font-bold text-slate-900 mt-4 mb-2">
          Unauthorized Access
        </h1>

        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          You do not have the necessary role permissions to access this page or resource. ClassPilot enforces strict role-based separation between Student and Faculty portals.
        </p>

        {role && (
          <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-left">
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Current User:</span>
              <span className="font-semibold text-slate-900">{user?.full_name || user?.username}</span>
            </div>
            <div className="flex justify-between py-1 border-t border-slate-200">
              <span className="text-slate-500">Assigned Role:</span>
              <span className="font-semibold text-indigo-600">{role}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={handleGoDashboard}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>Go to My Dashboard</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign In with Different Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
