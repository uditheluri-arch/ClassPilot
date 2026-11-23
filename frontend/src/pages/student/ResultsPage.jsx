import React, { useState, useEffect } from 'react';
import { getMyResults } from '../../services/academicService';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Award, CheckCircle, XCircle, TrendingUp, BookOpen, AlertCircle, Calendar } from 'lucide-react';
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
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Academic Performance & Results</h1>
              <p className="text-gray-500 text-sm mt-1">
                Official published examination marks, passing verification, and subject metrics.
              </p>
            </div>
            <Link
              to="/student/exams"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-50 transition shadow-sm"
            >
              <Calendar className="w-4 h-4 text-indigo-600" />
              View Exam Schedules
            </Link>
          </div>

          {/* Metrics Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Published Exams</p>
                <p className="text-2xl font-bold text-gray-900">{totalExams}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Overall Average</p>
                <p className="text-2xl font-bold text-purple-600">{avgPercentage}%</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Exams Passed</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {passedCount} / {totalExams}
                </p>
              </div>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Scorecard & Subject Breakdown</h2>
              <span className="text-xs text-gray-500">Official Records</span>
            </div>

            {error ? (
              <div className="p-8 text-center text-red-600 text-sm">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                {error}
              </div>
            ) : results.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-gray-800">No published results yet</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Exam marks are pending evaluation or have not yet been published by faculty. Check back once results are officially released.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
                      <th className="py-3 px-6">Subject</th>
                      <th className="py-3 px-6">Examination</th>
                      <th className="py-3 px-6">Date</th>
                      <th className="py-3 px-6 text-center">Marks Obtained</th>
                      <th className="py-3 px-6 text-center">Percentage</th>
                      <th className="py-3 px-6 text-center">Status</th>
                      <th className="py-3 px-6">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {results.map((res) => {
                      const examDate = new Date(res.exam_date);
                      return (
                        <tr key={res.examination_id} className="hover:bg-gray-50/70 transition">
                          <td className="py-4 px-6">
                            <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-mono font-medium mb-1">
                              {res.subject_code}
                            </span>
                            <div className="font-semibold text-gray-900">{res.subject_name}</div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-medium text-gray-900 block">{res.exam_name}</span>
                            <span className="text-xs text-gray-500">{res.exam_type}</span>
                          </td>
                          <td className="py-4 px-6 text-xs text-gray-600 whitespace-nowrap">
                            {examDate.toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-4 px-6 text-center whitespace-nowrap">
                            <span className="font-bold text-gray-900 text-base">{res.marks_obtained}</span>
                            <span className="text-xs text-gray-400"> / {res.max_marks}</span>
                            <span className="block text-[11px] text-gray-400">Pass: {res.passing_marks}</span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="font-bold text-gray-900">{res.percentage}%</span>
                            <div className="w-16 bg-gray-100 h-1.5 rounded-full mx-auto mt-1 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  res.is_passed ? 'bg-emerald-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(res.percentage, 100)}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-center whitespace-nowrap">
                            {res.is_passed ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Passed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-200">
                                <XCircle className="w-3.5 h-3.5" />
                                Failed
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-xs text-gray-600 max-w-xs">
                            {res.remarks || <span className="text-gray-400 italic">No remarks</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ResultsPage;
