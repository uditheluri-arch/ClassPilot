import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import {
  GraduationCap,
  Briefcase,
  Lock,
  UserCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export const LoginPage = () => {
  const [role, setRole] = useState('STUDENT'); // 'STUDENT' | 'FACULTY'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isStudent = role === 'STUDENT';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim()) {
      setError(isStudent ? 'Please enter your Roll Number' : 'Please enter your Employee ID or Email');
      return;
    }

    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);

    try {
      const data = await login({
        role,
        identifier: identifier.trim(),
        password,
      });

      // Role-based redirection
      if (data.role === 'STUDENT') {
        navigate('/student/dashboard', { replace: true });
      } else if (data.role === 'FACULTY') {
        navigate('/faculty/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      let errorMsg = 'Authentication failed. Please verify your credentials and try again.';
      if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      } else if (err.message === 'Network Error' || !err.response) {
        errorMsg = 'Unable to connect to ClassPilot server. Please verify the backend is running on http://127.0.0.1:8000.';
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setIdentifier('');
    setPassword('');
    setError('');
  };

  const fillDemoStudent = () => {
    setRole('STUDENT');
    setIdentifier('STU001');
    setPassword('Student@123');
    setError('');
  };

  const fillDemoFaculty = () => {
    setRole('FACULTY');
    setIdentifier('FAC001');
    setPassword('Faculty@123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <GraduationCap className="w-8 h-8" />
          </div>
        </div>

        <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          ClassPilot
        </h1>
        <p className="text-center text-xs font-semibold tracking-wide uppercase text-indigo-600 mt-1">
          Smart Academic Management System
        </p>
        <p className="text-center text-sm text-slate-500 mt-0.5">
          Learning. Managing. Growing.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          {/* Role Selection Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-2">
              Select Your Portal
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleRoleChange('STUDENT')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isStudent
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('FACULTY')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  !isStudent
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Faculty</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
              <div className="flex-1 font-medium leading-snug">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                {isStudent ? 'Roll Number' : 'Employee ID or Institutional Email'}
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={isStudent ? 'e.g. STU001' : 'e.g. FAC001 or faculty@classpilot.demo'}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
              </div>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In as {isStudent ? 'Student' : 'Faculty'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials Fillers */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 text-center">
              Quick Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillDemoStudent}
                className="px-2.5 py-2 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors text-center"
              >
                Fill Student (STU001)
              </button>
              <button
                type="button"
                onClick={fillDemoFaculty}
                className="px-2.5 py-2 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors text-center"
              >
                Fill Faculty (FAC001)
              </button>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Phase 1 Foundation • Controlled Provisioning Only • No Public Registration
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
