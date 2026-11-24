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
import { Loader2, ArrowRight } from 'lucide-react';

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
        <div className="flex flex-col items-center justify-center py-20 text-[#64748B]">
          <Loader2 className="w-6 h-6 animate-spin text-[#315E91] mb-2" />
          <p className="text-sm">Loading Faculty Dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  const totalStudents = classes.reduce((sum, c) => sum + (c.student_count || 0), 0);
  const totalSubmissions = assignments.reduce((sum, a) => sum + (a.total_submissions || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-white border border-[#E2E8F0] rounded-md p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-[#315E91] mb-1">
                Faculty Workspace
              </div>
              <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
                {profile?.full_name || 'Faculty Member'}
              </h1>
              <p className="text-sm text-[#64748B] mt-1">
                Employee ID: <span className="font-mono text-[#172033]">{profile?.employee_id}</span>
                {profile?.email && ` • ${profile.email}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/faculty/students"
                className="px-3.5 py-2 text-sm font-medium text-[#315E91] bg-[#F0F5FA] border border-[#C3D9EB] rounded-md hover:bg-[#E1ECF5] transition-colors"
              >
                Search Students
              </Link>
            </div>
          </div>
        </div>

        {/* Overview Metric Cards (Academic information, no random icons) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-[#E2E8F0] rounded-md p-4">
            <div className="text-xs font-medium text-[#64748B]">Assigned Classes</div>
            <div className="text-2xl font-bold text-[#172033] mt-1">
              {classes.length}
            </div>
            <div className="text-xs text-[#64748B] mt-1">Grade sections taught</div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-md p-4">
            <div className="text-xs font-medium text-[#64748B]">Enrolled Students</div>
            <div className="text-2xl font-bold text-[#172033] mt-1">
              {totalStudents}
            </div>
            <div className="text-xs text-[#64748B] mt-1">Across assigned rosters</div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-md p-4">
            <div className="text-xs font-medium text-[#64748B]">Active Evaluations</div>
            <div className="text-2xl font-bold text-[#172033] mt-1">
              {exams.length}
            </div>
            <div className="text-xs text-[#64748B] mt-1">Exams and tests managed</div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-md p-4">
            <div className="text-xs font-medium text-[#64748B]">Student Submissions</div>
            <div className="text-2xl font-bold text-[#172033] mt-1">
              {totalSubmissions}
            </div>
            <div className="text-xs text-[#64748B] mt-1">Received for evaluation</div>
          </div>
        </div>

        {/* Structured Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assigned Classes */}
          <div className="bg-white border border-[#E2E8F0] rounded-md p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="text-base font-bold text-[#172033]">Teaching Allocations</h2>
                  <p className="text-xs text-[#64748B]">Classes and course sections</p>
                </div>
                <Link
                  to="/faculty/classes"
                  className="text-xs font-semibold text-[#315E91] hover:underline inline-flex items-center gap-1"
                >
                  Manage
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="mt-4 divide-y divide-[#E2E8F0]">
                {classes.map((cls) => (
                  <div key={cls.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#172033]">
                          {cls.name} — Section {cls.section || 'A'}
                        </p>
                        <p className="text-xs text-[#64748B] line-clamp-1">
                          {cls.description || 'Assigned academic section'}
                        </p>
                      </div>
                      <span className="text-xs text-[#172033] font-mono px-2 py-0.5 rounded border border-[#E2E8F0] bg-slate-50">
                        {cls.student_count || 0} students
                      </span>
                    </div>
                  </div>
                ))}
                {classes.length === 0 && (
                  <p className="text-xs text-[#64748B] py-4 text-center">No classes currently assigned.</p>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E2E8F0]">
              <Link
                to="/faculty/students"
                className="text-xs text-[#64748B] hover:text-[#172033] inline-flex items-center gap-1"
              >
                Access student rosters and search directory →
              </Link>
            </div>
          </div>

          {/* Managed Examinations */}
          <div className="bg-white border border-[#E2E8F0] rounded-md p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="text-base font-bold text-[#172033]">Recent Examinations</h2>
                  <p className="text-xs text-[#64748B]">Marks entry and result publication</p>
                </div>
                <Link
                  to="/faculty/exams"
                  className="text-xs font-semibold text-[#315E91] hover:underline inline-flex items-center gap-1"
                >
                  Manage
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="mt-4 divide-y divide-[#E2E8F0]">
                {exams.slice(0, 3).map((exam) => (
                  <div key={exam.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-[#172033]">{exam.name}</p>
                        <p className="text-xs text-[#64748B]">
                          {exam.class_name} • {exam.subject_name} • Max: {exam.max_marks}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded border ${
                          exam.is_published
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {exam.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                ))}
                {exams.length === 0 && (
                  <p className="text-xs text-[#64748B] py-4 text-center">No exams scheduled.</p>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E2E8F0]">
              <Link
                to="/faculty/materials"
                className="text-xs text-[#64748B] hover:text-[#172033] inline-flex items-center gap-1"
              >
                Upload and distribute class study materials →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FacultyDashboard;
