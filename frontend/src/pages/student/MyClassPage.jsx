import React, { useState, useEffect } from 'react';
import { getMyClass } from '../../services/academicService';
import DashboardLayout from '../../layouts/DashboardLayout';
import { AlertCircle, Loader2 } from 'lucide-react';

const MyClassPage = () => {
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClassData();
  }, []);

  const fetchClassData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyClass();
      setClassData(data);
    } catch (err) {
      console.error('Failed to load class details:', err);
      setError(err.response?.data?.detail || 'Failed to load your class information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#64748B]">
          <Loader2 className="w-6 h-6 animate-spin text-[#315E91] mb-2" />
          <p className="text-sm">Loading Class & Curriculum...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-red-800">Class Information Unavailable</h3>
              <p className="text-xs text-red-600 mt-1">{error}</p>
              <button
                onClick={fetchClassData}
                className="mt-3 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Card (Clean Left Aligned, No Gradients) */}
          <div className="bg-white border border-[#E2E8F0] rounded-md p-6">
            <div className="text-xs font-semibold text-[#315E91] mb-1">
              Class Enrollment
            </div>
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
                {classData.name} — Section {classData.section || 'A'}
              </h1>
              <span className="text-xs font-mono text-[#64748B]">
                Academic Year 2026–2027
              </span>
            </div>
            <p className="text-sm text-[#64748B] mt-2 max-w-2xl">
              {classData.description || 'Enrolled academic curriculum and scheduled subjects for this class.'}
            </p>
          </div>

          {/* Curriculum Subjects Table */}
          <div className="bg-white border border-[#E2E8F0] rounded-md p-6">
            <div className="pb-4 border-b border-[#E2E8F0] mb-4">
              <h2 className="text-lg font-bold text-[#172033]">Enrolled Subjects</h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                List of active courses offered in {classData.name}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B]">
                    <th className="py-2.5 px-3">Subject Code</th>
                    <th className="py-2.5 px-3">Subject Name</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-sm">
                  {classData.subjects && classData.subjects.length > 0 ? (
                    classData.subjects.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3 font-mono font-semibold text-[#315E91] text-xs">
                          {sub.code}
                        </td>
                        <td className="py-3 px-3 font-medium text-[#172033]">
                          {sub.name}
                        </td>
                        <td className="py-3 px-3 text-[#64748B] text-xs max-w-md">
                          {sub.description || 'Standard institutional syllabus'}
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-xs font-medium px-2 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-200">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-6 text-center text-xs text-[#64748B]">
                        No subjects mapped to this class.
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

export default MyClassPage;
