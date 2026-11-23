import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 mx-auto mb-4">
          <FileQuestion className="w-8 h-8" />
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
          Error 404
        </span>

        <h1 className="text-2xl font-bold text-slate-900 mt-4 mb-2">
          Page Not Found
        </h1>

        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          The academic module or resource you requested could not be located in ClassPilot.
        </p>

        <button
          onClick={handleReturn}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Home className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
