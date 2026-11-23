import React, { useState, useEffect } from 'react';
import { getStudentExams } from '../../services/academicService';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Calendar, Clock, Award, FileText, CheckCircle, AlertCircle, BookOpen } from 'lucide-react';
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
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Examinations & Schedules</h1>
              <p className="text-gray-500 text-sm mt-1">
                Track upcoming unit tests, mid-terms, and final exam schedules.
              </p>
            </div>
            <Link
              to="/student/results"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 font-semibold text-sm rounded-xl hover:bg-indigo-100 transition"
            >
              <Award className="w-4 h-4" />
              View Published Results
            </Link>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">{exams.length}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Upcoming Exams</p>
                <p className="text-2xl font-bold text-amber-600">{upcomingCount}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Completed</p>
                <p className="text-2xl font-bold text-emerald-600">{completedCount}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 gap-2">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`pb-3 px-3 text-sm font-semibold transition border-b-2 ${
                activeTab === 'ALL'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              All Exams ({exams.length})
            </button>
            <button
              onClick={() => setActiveTab('UPCOMING')}
              className={`pb-3 px-3 text-sm font-semibold transition border-b-2 ${
                activeTab === 'UPCOMING'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Upcoming ({upcomingCount})
            </button>
            <button
              onClick={() => setActiveTab('COMPLETED')}
              className={`pb-3 px-3 text-sm font-semibold transition border-b-2 ${
                activeTab === 'COMPLETED'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          {/* Exams Grid */}
          {error ? (
            <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-center text-red-700">
              {error}
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-800">No examinations found</h3>
              <p className="text-sm text-gray-500 mt-1">There are no examinations in this category right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredExams.map((exam) => {
                const upcoming = isUpcoming(exam.exam_date);
                const examDate = new Date(exam.exam_date);

                return (
                  <div
                    key={exam.id}
                    className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow relative overflow-hidden"
                  >
                    <div
                      className={`absolute top-0 left-0 right-0 h-1.5 ${
                        upcoming ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                    ></div>

                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-semibold uppercase tracking-wider mb-2">
                          {exam.subject_code} • {exam.subject_name}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900">{exam.name}</h3>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shrink-0 ${
                          upcoming
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {upcoming ? 'Upcoming' : 'Completed'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 my-4 bg-gray-50 p-3.5 rounded-xl text-xs">
                      <div>
                        <span className="text-gray-500 block mb-0.5">Date & Time</span>
                        <span className="font-semibold text-gray-800">
                          {examDate.toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                          {exam.start_time && ` at ${exam.start_time}`}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block mb-0.5">Duration</span>
                        <span className="font-semibold text-gray-800">{exam.duration_minutes} Mins</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block mb-0.5">Max Marks</span>
                        <span className="font-semibold text-gray-800">{exam.max_marks} pts</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block mb-0.5">Passing Marks</span>
                        <span className="font-semibold text-gray-800">{exam.passing_marks} pts</span>
                      </div>
                    </div>

                    {exam.instructions && (
                      <p className="text-xs text-gray-600 bg-blue-50/60 border border-blue-100 p-2.5 rounded-lg mb-4">
                        <span className="font-semibold text-blue-900">Instructions: </span>
                        {exam.instructions}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
                      <span>Exam Type: <strong className="text-gray-700">{exam.exam_type}</strong></span>
                      {exam.is_published ? (
                        <Link
                          to="/student/results"
                          className="font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                        >
                          <Award className="w-3.5 h-3.5" />
                          Results Published
                        </Link>
                      ) : (
                        <span className="text-gray-400">Results Pending</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default ExamsPage;
