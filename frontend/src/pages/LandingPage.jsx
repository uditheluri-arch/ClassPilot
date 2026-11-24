import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import {
  GraduationCap,
  Users,
  BookOpen,
  FileCheck2,
  FolderOpen,
  ShieldCheck,
  ArrowRight,
  Database,
  Lock,
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const handlePortalRedirect = () => {
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

  const capabilities = [
    {
      title: 'Class & Subject Structure',
      description: 'Manage grade-level classes, multi-subject curriculum offerings, and single-class student enrollment rules.',
      category: 'Curriculum',
    },
    {
      title: 'Faculty Teaching Allocations',
      description: 'Assign faculty members to specific class-subject combinations with access restricted strictly to their assigned rosters.',
      category: 'Administration',
    },
    {
      title: 'Examinations & Marks Evaluation',
      description: 'Schedule unit tests and mid-terms, record validated student marks, compute percentages, and publish results.',
      category: 'Evaluation',
    },
    {
      title: 'Assignments & Submissions',
      description: 'Distribute coursework with deadlines and attachments, track student submissions, and record faculty feedback.',
      category: 'Coursework',
    },
    {
      title: 'Study Materials Repository',
      description: 'Centralize lecture notes, syllabi, and reference documents categorized by class and subject for student access.',
      category: 'Resources',
    },
    {
      title: 'Role-Based Access Control',
      description: 'Stateless JWT authentication enforcing strict boundary separation between student and faculty portals.',
      category: 'Security',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#172033] flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="bg-white border-b border-[#E2E8F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[#315E91] flex items-center justify-center text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-[#172033]">ClassPilot</span>
              <span className="text-xs text-[#64748B] block -mt-1">Academic Management</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <button
                onClick={handlePortalRedirect}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#315E91] text-white text-sm font-medium rounded-md hover:bg-[#264D78] transition-colors"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#315E91] text-white text-sm font-medium rounded-md hover:bg-[#264D78] transition-colors"
              >
                <span>Sign In to Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content (Intentional Left Alignment) */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 lg:py-16">
        {/* Hero Section */}
        <div className="max-w-3xl">
          <div className="text-sm font-semibold text-[#315E91] mb-3">
            Academic Information & Operations Platform
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#172033] tracking-tight leading-tight">
            Structured academic management for educational institutions.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#64748B] leading-relaxed">
            ClassPilot coordinates institutional workflows across students, faculty, classes, subjects, examinations, marks, assignments, and study materials within a unified, role-governed environment.
          </p>

          {/* Prominent Primary CTA */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={handlePortalRedirect}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#315E91] text-white text-sm font-semibold rounded-md hover:bg-[#264D78] transition-colors shadow-sm"
            >
              <span>{isAuthenticated ? 'Open My Dashboard' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <span className="text-xs text-[#64748B]">
              Role-restricted access for enrolled students and assigned faculty.
            </span>
          </div>
        </div>

        {/* Divider */}
        <hr className="my-12 border-[#E2E8F0]" />

        {/* Core Modules Breakdown */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-[#172033]">Core System Modules</h2>
            <p className="text-sm text-[#64748B] mt-1">
              ClassPilot organizes institutional academic data into six core functional areas:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {capabilities.map((item) => (
              <div
                key={item.title}
                className="bg-white border border-[#E2E8F0] rounded-md p-5 text-left"
              >
                <div className="text-xs font-semibold text-[#315E91] mb-1.5">
                  {item.category}
                </div>
                <h3 className="text-base font-bold text-[#172033] mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* System Architecture Specification */}
        <div className="mt-12 bg-white border border-[#E2E8F0] rounded-md p-6">
          <h2 className="text-lg font-bold text-[#172033] mb-2">Operational Integrity & Security</h2>
          <p className="text-sm text-[#64748B] leading-relaxed max-w-3xl">
            All database operations run on PostgreSQL with foreign-key referential integrity and transactional migrations. Requests require cryptographically signed JWT credentials, preventing unauthorized cross-role access between student records and faculty administrative actions.
          </p>

          <div className="mt-4 pt-4 border-t border-[#E2E8F0] flex flex-wrap gap-6 text-xs text-[#64748B]">
            <div>
              <span className="font-semibold text-[#172033]">Student Scope:</span> Enrolled class subjects, exam schedules, personal results, task submissions.
            </div>
            <div>
              <span className="font-semibold text-[#172033]">Faculty Scope:</span> Assigned classes, student rosters, exam management, marks evaluation, course uploads.
            </div>
          </div>
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="bg-white border-t border-[#E2E8F0] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#172033]">ClassPilot</span>
            <span>•</span>
            <span>Academic Management System</span>
          </div>
          <div>
            Learning. Managing. Growing.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
