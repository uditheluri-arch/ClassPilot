import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { FileQuestion, Home } from 'lucide-react';

export const NotFoundPage = () => {
  const { role, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleReturn = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (role === 'STUDENT') {
      navigate('/student/dashboard');
    } else if (role === 'FACULTY') {
      navigate('/faculty/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-[#E2E8F0] rounded-md p-8 shadow-xs text-left">
        <div className="w-12 h-12 rounded-md bg-[#F7F8FA] border border-[#E2E8F0] flex items-center justify-center text-[#64748B] mb-4">
          <FileQuestion className="w-6 h-6" />
        </div>

        <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-[#F7F8FA] border border-[#E2E8F0] text-[#64748B] mb-2">
          Error 404
        </span>

        <h1 className="text-xl font-bold text-[#172033] mt-2 mb-2">
          Page Not Found
        </h1>

        <p className="text-xs text-[#64748B] leading-relaxed mb-6">
          The requested page or academic resource could not be found. Please return to your portal dashboard or check the link.
        </p>

        <button
          onClick={handleReturn}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md text-xs font-medium text-white bg-[#315E91] hover:bg-[#264D78] transition shadow-xs"
        >
          <Home className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
