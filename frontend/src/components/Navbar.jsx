import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { GraduationCap, LogOut, User as UserIcon, Shield } from 'lucide-react';

export const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isStudent = role === 'STUDENT';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">ClassPilot</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Phase 1
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Learning. Managing. Growing.</p>
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-700">
                <UserIcon className="w-5 h-5" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-slate-900 leading-tight">
                  {user?.full_name || user?.username || 'Authenticated User'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[11px] font-medium px-2 py-0.2 rounded-full border ${
                    isStudent
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {role}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {user?.identifier}
                  </span>
                </div>
              </div>
            </div>

            {/* Logout Action */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-colors"
              title="Sign out of ClassPilot"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
