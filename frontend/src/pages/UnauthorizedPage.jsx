import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ShieldAlert, Home, LogOut } from 'lucide-react';

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
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-[#E2E8F0] rounded-md p-8 shadow-xs text-left">
        <div className="w-12 h-12 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 mb-2">
          Access Restricted • 403 Forbidden
        </span>

        <h1 className="text-xl font-bold text-[#172033] mt-2 mb-2">
          Unauthorized Access
        </h1>

        <p className="text-xs text-[#64748B] leading-relaxed mb-6">
          You do not have the required role permissions to access this page or resource. ClassPilot enforces role-based access control between Student and Faculty portals.
        </p>

        {role && (
          <div className="mb-6 p-3 bg-[#F7F8FA] border border-[#E2E8F0] rounded text-xs">
            <div className="flex justify-between py-1">
              <span className="text-[#64748B]">Current Account:</span>
              <span className="font-semibold text-[#172033]">{user?.full_name || user?.username}</span>
            </div>
            <div className="flex justify-between py-1 border-t border-[#E2E8F0]">
              <span className="text-[#64748B]">Assigned Role:</span>
              <span className="font-semibold text-[#315E91]">{role}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleGoDashboard}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md text-xs font-medium text-white bg-[#315E91] hover:bg-[#264D78] transition shadow-xs"
          >
            <Home className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md text-xs font-medium text-[#64748B] hover:text-[#172033] bg-[#F7F8FA] border border-[#E2E8F0] hover:bg-[#E2E8F0] transition"
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
