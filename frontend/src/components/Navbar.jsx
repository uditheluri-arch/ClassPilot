import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { GraduationCap, LogOut, User as UserIcon } from 'lucide-react';

export const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isStudent = role === 'STUDENT';

  return (
    <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Identity */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[#315E91] flex items-center justify-center text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-[#172033]">ClassPilot</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded border border-[#E2E8F0] bg-slate-50 text-[#64748B]">
                  System
                </span>
              </div>
              <p className="text-xs text-[#64748B] hidden sm:block">Academic Management System</p>
            </div>
          </Link>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-[#E2E8F0]">
              <div className="w-8 h-8 rounded-md bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-[#315E91]">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-[#172033] leading-tight">
                  {user?.full_name || user?.username || 'Authenticated User'}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-medium text-[#64748B]">
                    {isStudent ? 'Student Account' : 'Faculty Member'}
                  </span>
                  <span className="text-xs font-mono text-[#94A3B8]">
                    {user?.identifier}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-[#64748B] hover:text-red-700 hover:bg-red-50 border border-[#E2E8F0] hover:border-red-200 transition-colors"
              title="Sign out of ClassPilot"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
