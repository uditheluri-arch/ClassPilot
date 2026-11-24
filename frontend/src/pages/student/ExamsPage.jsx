import React, { useState, useEffect } from 'react';
import { getStudentExams } from '../../services/academicService';
import DashboardLayout from '../../layouts/DashboardLayout';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const ExamsPage = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStudentExams();
      setExams(data);
    } catch (err) {
      console.error('Failed to load examinations:', err);
      setError(err.response?.data?.detail || 'Failed to load examinations schedule.');
    } finally {
      setLoading(false);
    }
  };

  const isUpcoming = (dateStr) => new Date(dateStr) > new Date();

  const filteredExams = exams.filter((exam) => {
    if (activeTab === 'UPCOMING') return isUpcoming(exam.exam_date);
    if (activeTab === 'COMPLETED') return !isUpcoming(exam.exam_date);
    return true;
  });

  const upcomingCount = exams.filter((e) => isUpcoming(e.exam_date)).length;
  const completedCount = exams.length - upcomingCount;

  return (
    <DashboardLayout>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#64748B]">
          <Loader2 className="w-6 h-6 animate-spin text-[#315E91] mb-2" />
          <p className="text-sm">Loading Examination Schedules...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
                Examination Schedules
              </h1>
              <p className="text-sm text-[#64748B] mt-1">
                Official test timetables, durations, and maximum marks for enrolled courses.
              </p>
            </div>
            <Link
              to="/student/results"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-[#E2E8F0] text-[#172033] text-sm font-medium rounded-md hover:bg-slate-50 transition-colors shadow-sm"
            >
              <span>View Performance & Results</span>
            </Link>
          </div>

          {error && (
            <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'ALL'
                  ? 'bg-[#315E91] text-white'
                  : 'text-[#64748B] hover:text-[#172033] hover:bg-slate-100'
              }`}
            >
              All Evaluations ({exams.length})
            </button>
            <button
              onClick={() => setActiveTab('UPCOMING')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'UPCOMING'
                  ? 'bg-[#315E91] text-white'
                  : 'text-[#64748B] hover:text-[#172033] hover:bg-slate-100'
              }`}
            >
              Upcoming ({upcomingCount})
            </button>
            <button
              onClick={() => setActiveTab('COMPLETED')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'COMPLETED'
                  ? 'bg-[#315E91] text-white'
                  : 'text-[#64748B] hover:text-[#172033] hover:bg-slate-100'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          {/* Examination Table */}
          <div className="bg-white border border-[#E2E8F0] rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-slate-50/50 text-xs font-semibold text-[#64748B]">
                    <th className="py-2.5 px-4">Subject</th>
                    <th className="py-2.5 px-4">Examination</th>
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4">Date & Time</th>
                    <th className="py-2.5 px-4">Duration</th>
                    <th className="py-2.5 px-4">Max Marks</th>
                    <th className="py-2.5 px-4">Pass Marks</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-sm">
                  {filteredExams.length > 0 ? (
                    filteredExams.map((exam) => {
                      const upcoming = isUpcoming(exam.exam_date);
                      return (
                        <tr key={exam.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-semibold text-[#172033] block">{exam.subject_name}</span>
                            <span className="text-xs font-mono text-[#64748B]">{exam.subject_code}</span>
                          </td>
                          <td className="py-3 px-4 font-medium text-[#172033]">
                            {exam.name}
                          </td>
                          <td className="py-3 px-4 text-xs text-[#64748B]">
                            {exam.exam_type ? exam.exam_type.replace('_', ' ') : 'Unit Test'}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-xs text-[#172033] font-medium block">
                              {exam.exam_date ? new Date(exam.exam_date).toLocaleDateString() : 'TBD'}
                            </span>
                            <span className="text-xs text-[#64748B]">
                              {exam.start_time || '10:00 AM'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-[#64748B]">
                            {exam.duration_minutes ? `${exam.duration_minutes} mins` : '90 mins'}
                          </td>
                          <td className="py-3 px-4 font-mono font-medium text-[#172033] text-xs">
                            {exam.max_marks}
                          </td>
                          <td className="py-3 px-4 font-mono text-[#64748B] text-xs">
                            {exam.passing_marks || (exam.max_marks * 0.4).toFixed(0)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded border ${
                                upcoming
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {upcoming ? 'Scheduled' : 'Concluded'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-xs text-[#64748B]">
                        No examinations match the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ExamsPage;
