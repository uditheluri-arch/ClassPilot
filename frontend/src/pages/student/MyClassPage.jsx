import React, { useState, useEffect } from 'react';
import { getMyClass } from '../../services/academicService';
import DashboardLayout from '../../layouts/DashboardLayout';
import { BookOpen, Users, GraduationCap, Award, Info, AlertCircle } from 'lucide-react';

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
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-xl mx-auto my-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-800 mb-1">Class Information Unavailable</h3>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button
            onClick={fetchClassData}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 rounded-2xl p-6 md:p-8 text-white shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide uppercase">
                    Section {classData.section || 'A'}
                  </span>
                  <span className="text-indigo-200 text-sm">Academic Year 2026-2027</span>
                </div>
                <h1 className="text-3xl font-bold">{classData.name}</h1>
                <p className="text-indigo-100 text-sm mt-1 max-w-xl">
                  {classData.description || 'Welcome to your academic cohort workspace and curriculum overview.'}
                </p>
              </div>
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20 self-start md:self-auto">
                <Users className="w-8 h-8 text-indigo-200" />
                <div>
                  <p className="text-xs text-indigo-200 font-medium">Class Strength</p>
                  <p className="text-2xl font-bold">{classData.student_count} Students</p>
                </div>
              </div>
            </div>
          </div>

          {/* Curriculum & Subjects */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Enrolled Curriculum & Subjects</h2>
                <p className="text-sm text-gray-500">Official subjects registered for your class</p>
              </div>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold">
                {classData.subjects?.length || 0} Subjects
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {classData.subjects && classData.subjects.length > 0 ? (
                classData.subjects.map((sub) => (
                  <div
                    key={sub.class_subject_id || sub.subject_id}
                    className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow relative overflow-hidden group"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-mono font-semibold mb-2">
                          {sub.code}
                        </span>
                        <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {sub.name}
                        </h3>
                      </div>
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3 line-clamp-2">
                      {sub.description || 'Core curriculum syllabus and study materials.'}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center">
                  <BookOpen className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No subjects mapped to this class yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyClassPage;
