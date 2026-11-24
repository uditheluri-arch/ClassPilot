import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import {
  GraduationCap,
  Lock,
  UserCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
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
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <Link to="/" className="inline-flex items-center gap-2 mb-6 text-[#172033] hover:opacity-90">
          <div className="w-8 h-8 rounded-md bg-[#315E91] flex items-center justify-center text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">ClassPilot</span>
        </Link>

        <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
          Portal Sign In
        </h1>
        <p className="text-sm text-[#64748B] mt-1">
          Select your institutional role to access coursework, examinations, and records.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-6 border border-[#E2E8F0] rounded-md shadow-sm sm:px-8">
          {/* Role Selection Tabs */}
          <div className="mb-5">
            <div className="text-xs font-semibold text-[#64748B] mb-2">
              Select Account Role
            </div>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#F1F5F9] rounded-md">
              <button
                type="button"
                onClick={() => handleRoleChange('STUDENT')}
                className={`py-2 text-sm font-semibold rounded transition-colors ${
                  isStudent
                    ? 'bg-white text-[#315E91] shadow-sm'
                    : 'text-[#64748B] hover:text-[#172033]'
                }`}
              >
                Student
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('FACULTY')}
                className={`py-2 text-sm font-semibold rounded transition-colors ${
                  !isStudent
                    ? 'bg-white text-[#315E91] shadow-sm'
                    : 'text-[#64748B] hover:text-[#172033]'
                }`}
              >
                Faculty
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <div className="flex-1 font-medium leading-snug">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-[#172033] mb-1"
              >
                {isStudent ? 'Roll Number' : 'Employee ID or Institutional Email'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
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
                  className="block w-full pl-9 pr-3 py-2 border border-[#E2E8F0] rounded-md text-sm text-[#172033] placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#315E91] focus:border-[#315E91] transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#172033] mb-1"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94A3B8]">
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
                  placeholder="Enter account password"
                  className="block w-full pl-9 pr-10 py-2 border border-[#E2E8F0] rounded-md text-sm text-[#172033] placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#315E91] focus:border-[#315E91] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94A3B8] hover:text-[#64748B] focus:outline-none"
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
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-semibold text-white bg-[#315E91] hover:bg-[#264D78] focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#315E91] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-5 pt-4 border-t border-[#E2E8F0]">
            <p className="text-xs font-semibold text-[#64748B] mb-2">
              Demo Credentials (Pre-Seeded)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillDemoStudent}
                className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-[#F0F5FA] text-[#315E91] border border-[#C3D9EB] hover:bg-[#E1ECF5] transition-colors text-center"
              >
                Fill Student (STU001)
              </button>
              <button
                type="button"
                onClick={fillDemoFaculty}
                className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-[#F0F5FA] text-[#315E91] border border-[#C3D9EB] hover:bg-[#E1ECF5] transition-colors text-center"
              >
                Fill Faculty (FAC001)
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="text-xs text-[#64748B] hover:text-[#172033]">
            ← Return to Overview
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
