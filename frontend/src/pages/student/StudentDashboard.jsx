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
import { Loader2, ArrowRight } from 'lucide-react';

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
        <div className="flex flex-col items-center justify-center py-20 text-[#64748B]">
          <Loader2 className="w-6 h-6 animate-spin text-[#315E91] mb-2" />
          <p className="text-sm">Loading Student Dashboard...</p>
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
        {/* Welcome Header */}
        <div className="bg-white border border-[#E2E8F0] rounded-md p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-[#315E91] mb-1">
                {classInfo?.name ? `${classInfo.name} • Section ${classInfo.section || 'A'}` : 'Enrolled Student'}
              </div>
              <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
                {profile?.full_name || 'Student Portal'}
              </h1>
              <p className="text-sm text-[#64748B] mt-1">
                Roll Number: <span className="font-mono text-[#172033]">{profile?.roll_number}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/student/my-class"
                className="px-3.5 py-2 text-sm font-medium text-[#315E91] bg-[#F0F5FA] border border-[#C3D9EB] rounded-md hover:bg-[#E1ECF5] transition-colors"
              >
                View Curriculum
              </Link>
            </div>
          </div>
        </div>

        {/* Academic Overview Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-[#E2E8F0] rounded-md p-4">
            <div className="text-xs font-medium text-[#64748B]">Enrolled Subjects</div>
            <div className="text-2xl font-bold text-[#172033] mt-1">
              {classInfo?.subjects?.length || 0}
            </div>
            <div className="text-xs text-[#64748B] mt-1">Current term courses</div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-md p-4">
            <div className="text-xs font-medium text-[#64748B]">Upcoming Exams</div>
            <div className="text-2xl font-bold text-[#172033] mt-1">
              {upcomingExams.length}
            </div>
            <div className="text-xs text-[#64748B] mt-1">Scheduled tests</div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-md p-4">
            <div className="text-xs font-medium text-[#64748B]">Pending Tasks</div>
            <div className="text-2xl font-bold text-[#172033] mt-1">
              {pendingAssignments.length}
            </div>
            <div className="text-xs text-[#64748B] mt-1">Awaiting submission</div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-md p-4">
            <div className="text-xs font-medium text-[#64748B]">Average Score</div>
            <div className="text-2xl font-bold text-[#172033] mt-1">
              {avgPercentage !== 'N/A' ? `${avgPercentage}%` : 'N/A'}
            </div>
            <div className="text-xs text-[#64748B] mt-1">Published examinations</div>
          </div>
        </div>

        {/* Two-Column Structured Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Examinations */}
          <div className="bg-white border border-[#E2E8F0] rounded-md p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="text-base font-bold text-[#172033]">Examination Schedules</h2>
                  <p className="text-xs text-[#64748B]">Scheduled academic evaluations</p>
                </div>
                <Link
                  to="/student/exams"
                  className="text-xs font-semibold text-[#315E91] hover:underline inline-flex items-center gap-1"
                >
                  View All
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
                          {exam.subject_name} • Max Marks: {exam.max_marks}
                        </p>
                      </div>
                      <span className="text-xs text-[#64748B] font-mono">
                        {exam.exam_date ? new Date(exam.exam_date).toLocaleDateString() : 'TBD'}
                      </span>
                    </div>
                  </div>
                ))}
                {exams.length === 0 && (
                  <p className="text-xs text-[#64748B] py-4 text-center">No examinations currently scheduled.</p>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E2E8F0]">
              <Link
                to="/student/results"
                className="text-xs text-[#64748B] hover:text-[#172033] inline-flex items-center gap-1"
              >
                Check published marks and performance history →
              </Link>
            </div>
          </div>

          {/* Pending Coursework & Tasks */}
          <div className="bg-white border border-[#E2E8F0] rounded-md p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div>
                  <h2 className="text-base font-bold text-[#172033]">Coursework & Assignments</h2>
                  <p className="text-xs text-[#64748B]">Active academic assignments</p>
                </div>
                <Link
                  to="/student/assignments"
                  className="text-xs font-semibold text-[#315E91] hover:underline inline-flex items-center gap-1"
                >
                  View All
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="mt-4 divide-y divide-[#E2E8F0]">
                {assignments.slice(0, 3).map((task) => (
                  <div key={task.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-[#172033]">{task.title}</p>
                        <p className="text-xs text-[#64748B]">
                          {task.subject_name} • Due: {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded border ${
                          task.submission_status === 'SUBMITTED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {task.submission_status === 'SUBMITTED' ? 'Submitted' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
                {assignments.length === 0 && (
                  <p className="text-xs text-[#64748B] py-4 text-center">No assignments assigned.</p>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E2E8F0]">
              <Link
                to="/student/materials"
                className="text-xs text-[#64748B] hover:text-[#172033] inline-flex items-center gap-1"
              >
                Access reference study materials and lecture documents →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
