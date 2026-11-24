import React, { useState, useEffect } from 'react';
import { getMyResults } from '../../services/academicService';
import DashboardLayout from '../../layouts/DashboardLayout';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const ResultsPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyResults();
      setResults(data);
    } catch (err) {
      console.error('Failed to load results:', err);
      setError(err.response?.data?.detail || 'Failed to load your examination results.');
    } finally {
      setLoading(false);
    }
  };

  const totalExams = results.length;
  const passedCount = results.filter((r) => r.is_passed).length;
  const avgPercentage = totalExams > 0
    ? (results.reduce((acc, r) => acc + (r.percentage || 0), 0) / totalExams).toFixed(1)
    : '0.0';

  return (
    <DashboardLayout>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#64748B]">
          <Loader2 className="w-6 h-6 animate-spin text-[#315E91] mb-2" />
          <p className="text-sm">Loading Academic Results...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
                Academic Performance & Results
              </h1>
              <p className="text-sm text-[#64748B] mt-1">
                Official marks and grades published by the faculty.
              </p>
            </div>
            <Link
              to="/student/exams"
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-[#E2E8F0] text-[#172033] text-sm font-medium rounded-md hover:bg-slate-50 transition-colors shadow-sm"
            >
              <span>View Examination Schedules</span>
            </Link>
          </div>

          {error && (
            <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Performance Summary Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#E2E8F0] rounded-md p-4">
              <div className="text-xs font-medium text-[#64748B]">Evaluations Recorded</div>
              <div className="text-2xl font-bold text-[#172033] mt-1">{totalExams}</div>
              <div className="text-xs text-[#64748B] mt-1">Published exams</div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-md p-4">
              <div className="text-xs font-medium text-[#64748B]">Cleared Evaluations</div>
              <div className="text-2xl font-bold text-[#172033] mt-1">{passedCount}</div>
              <div className="text-xs text-[#64748B] mt-1">Satisfied passing threshold</div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-md p-4">
              <div className="text-xs font-medium text-[#64748B]">Overall Average</div>
              <div className="text-2xl font-bold text-[#172033] mt-1">{avgPercentage}%</div>
              <div className="text-xs text-[#64748B] mt-1">Cumulative score across tests</div>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white border border-[#E2E8F0] rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-slate-50/50 text-xs font-semibold text-[#64748B]">
                    <th className="py-2.5 px-4">Subject</th>
                    <th className="py-2.5 px-4">Examination</th>
                    <th className="py-2.5 px-4">Score</th>
                    <th className="py-2.5 px-4">Percentage</th>
                    <th className="py-2.5 px-4">Grade</th>
                    <th className="py-2.5 px-4">Result</th>
                    <th className="py-2.5 px-4">Teacher Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-sm">
                  {results.length > 0 ? (
                    results.map((res) => (
                      <tr key={res.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-[#172033] block">{res.subject_name}</span>
                          <span className="text-xs font-mono text-[#64748B]">{res.subject_code}</span>
                        </td>
                        <td className="py-3 px-4 font-medium text-[#172033]">
                          {res.exam_name}
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-[#172033] text-xs">
                          {res.marks_obtained} / {res.max_marks}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-[#172033]">
                          {res.percentage ? `${res.percentage.toFixed(1)}%` : '—'}
                        </td>
                        <td className="py-3 px-4 font-bold text-xs text-[#172033]">
                          {res.grade || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded border ${
                              res.is_passed
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {res.is_passed ? 'Passed' : 'Needs Retake'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-[#64748B] max-w-xs">
                          {res.remarks || 'No remarks provided'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-xs text-[#64748B]">
                        No published examination results available for your profile.
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

export default ResultsPage;
