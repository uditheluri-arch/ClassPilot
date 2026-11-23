import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';
import {
  getFacultyClasses,
  getFacultyExams,
  getFacultyAssignments,
  getFacultyStudyMaterials,
} from '../../services/academicService';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  Briefcase,
  Users,
  BookOpen,
  FileCheck2,
  FolderOpen,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const FacultyDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileData, classesData, examsData, assignmentsData, materialsData] =
          await Promise.allSettled([
            authService.getFacultyProfile(),
            getFacultyClasses(),
            getFacultyExams(),
            getFacultyAssignments(),
            getFacultyStudyMaterials(),
          ]);

        if (profileData.status === 'fulfilled') setProfile(profileData.value);
        if (classesData.status === 'fulfilled') setClasses(classesData.value);
        if (examsData.status === 'fulfilled') setExams(examsData.value);
        if (assignmentsData.status === 'fulfilled') setAssignments(assignmentsData.value);
        if (materialsData.status === 'fulfilled') setMaterials(materialsData.value);
      } catch (err) {
        setError('Failed to load faculty dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
          <p className="text-sm font-medium">Loading Faculty Dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  const totalStudents = classes.reduce((sum, c) => sum + (c.student_count || 0), 0);
  const totalSubmissions = assignments.reduce((sum, a) => sum + (a.total_submissions || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-emerald-50 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Faculty Portal
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Employee ID: {profile?.employee_id}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Welcome back, {profile?.full_name}! 👋
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                ClassPilot – Smart Academic Management System • Step 2 Complete Academic Portal
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto">
              <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-left">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Faculty Role</p>
                <p className="text-sm font-bold text-slate-800">{profile?.role}</p>
              </div>
              <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-left">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Institutional Status</p>
                <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Modules Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Teaching Management Operations</h2>
            <span className="text-xs text-indigo-600 font-semibold">Active Cohorts</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/faculty/classes"
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition group block"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Classes</span>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">{classes.length} Assigned</p>
                  <p className="text-xs text-slate-500">{totalStudents} Total Students</p>
                </div>
              </div>
            </Link>

            <Link
              to="/faculty/exams"
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition group block"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Examinations</span>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">{exams.length} Created</p>
                  <p className="text-xs text-slate-500">
                    {exams.filter((e) => e.is_published).length} Published
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/faculty/assignments"
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-amber-200 transition group block"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Assignments</span>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 transition" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">{assignments.length} Coursework</p>
                  <p className="text-xs text-slate-500">{totalSubmissions} Submissions</p>
                </div>
              </div>
            </Link>

            <Link
              to="/faculty/materials"
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-emerald-200 transition group block"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Study Materials</span>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">{materials.length} Resources</p>
                  <p className="text-xs text-slate-500">Available to Students</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Informational Notice */}
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3 text-xs text-emerald-900">
          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
          <p>
            <strong>Step 2 Academic Controls Active:</strong> You can manage and create examinations, enter/update student marks, evaluate assignments with feedback, and share study materials exclusively for your assigned classes.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FacultyDashboard;
