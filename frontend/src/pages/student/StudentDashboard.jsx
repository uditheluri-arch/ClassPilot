import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';
import {
  getMyClass,
  getStudentExams,
  getStudentAssignments,
  getMyResults,
} from '../../services/academicService';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileCheck2,
  FolderOpen,
  Award,
  Sparkles,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';

export const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [classInfo, setClassInfo] = useState(null);
  const [exams, setExams] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileData, classData, examsData, assignmentsData, resultsData] =
          await Promise.allSettled([
            authService.getStudentProfile(),
            getMyClass(),
            getStudentExams(),
            getStudentAssignments(),
            getMyResults(),
          ]);

        if (profileData.status === 'fulfilled') setProfile(profileData.value);
        if (classData.status === 'fulfilled') setClassInfo(classData.value);
        if (examsData.status === 'fulfilled') setExams(examsData.value);
        if (assignmentsData.status === 'fulfilled') setAssignments(assignmentsData.value);
        if (resultsData.status === 'fulfilled') setResults(resultsData.value);
      } catch (err) {
        setError('Failed to load student dashboard information.');
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
          <p className="text-sm font-medium">Loading Student Dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  const upcomingExams = exams.filter((e) => new Date(e.exam_date) > new Date());
  const pendingAssignments = assignments.filter((a) => a.submission_status === 'PENDING');
  const avgPercentage =
    results.length > 0
      ? (results.reduce((acc, r) => acc + (r.percentage || 0), 0) / results.length).toFixed(1)
      : 'N/A';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-indigo-50 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {classInfo?.name ? `${classInfo.name} • Section ${classInfo.section || 'A'}` : 'Enrolled Student'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Roll: {profile?.roll_number}
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
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Academic Role</p>
                <p className="text-sm font-bold text-slate-800">{profile?.role}</p>
              </div>
              <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-left">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Account Status</p>
                <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Action Cards */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Academic Overview Modules</h2>
            <span className="text-xs text-indigo-600 font-semibold">Live System Data</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/student/my-class"
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition group block"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Class & Subjects</span>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">
                    {classInfo?.subjects?.length || 0} Subjects
                  </p>
                  <p className="text-xs text-slate-500">{classInfo?.name || 'Class Roster'}</p>
                </div>
              </div>
            </Link>

            <Link
              to="/student/exams"
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
                  <p className="text-lg font-bold text-slate-900">{upcomingExams.length} Upcoming</p>
                  <p className="text-xs text-slate-500">{exams.length} Total Scheduled</p>
                </div>
              </div>
            </Link>

            <Link
              to="/student/assignments"
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
                  <p className="text-lg font-bold text-slate-900">{pendingAssignments.length} Pending</p>
                  <p className="text-xs text-slate-500">{assignments.length} Total Active</p>
                </div>
              </div>
            </Link>

            <Link
              to="/student/results"
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-emerald-200 transition group block"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Performance</span>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">
                    {avgPercentage !== 'N/A' ? `${avgPercentage}%` : 'No marks yet'}
                  </p>
                  <p className="text-xs text-slate-500">{results.length} Published Exams</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Informational Notice */}
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex items-center gap-3 text-xs text-indigo-900">
          <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
          <p>
            <strong>Step 2 Academic Suite Active:</strong> You can view scheduled examinations, complete assignment tasks, access course handouts, and view officially published results directly from your portal.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
