import React, { useState, useEffect } from 'react';
import { getFacultyClasses, getTeachingAssignments } from '../../services/academicService';
import DashboardLayout from '../../layouts/DashboardLayout';
import { BookOpen, Users, GraduationCap, ChevronRight, FileText, Calendar, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyClassesPage = () => {
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [classesData, assignmentsData] = await Promise.all([
        getFacultyClasses(),
        getTeachingAssignments(),
      ]);
      setClasses(classesData);
      setAssignments(assignmentsData);
    } catch (err) {
      console.error('Failed to load classes:', err);
      setError(err.response?.data?.detail || 'Failed to load assigned classes.');
    } finally {
      setLoading(false);
    }
  };

  const getSubjectsForClass = (classId) => {
    return assignments.filter((a) => a.class_id === classId);
  };

  return (
    <DashboardLayout>
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Assigned Classes & Subjects</h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage coursework, examination schedules, and student rosters for your assigned academic cohorts.
            </p>
          </div>

          {error ? (
            <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200">{error}</div>
          ) : classes.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center">
              <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-800">No classes currently assigned</h3>
              <p className="text-sm text-gray-500 mt-1">
                Please contact academic administration to allocate your class-subject teaching assignments.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((cls) => {
                const classSubjects = getSubjectsForClass(cls.id);
                return (
                  <div
                    key={cls.id}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="inline-block px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider mb-1">
                            Section {cls.section || 'A'}
                          </span>
                          <h2 className="text-2xl font-bold text-gray-900">{cls.name}</h2>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-700">
                          <Users className="w-3.5 h-3.5" />
                          {cls.student_count} Students
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 leading-relaxed">
                        {cls.description || 'Assigned academic teaching cohort.'}
                      </p>

                      {/* Teaching Subjects */}
                      <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                          Subjects You Teach
                        </h3>
                        <div className="space-y-2">
                          {classSubjects.map((sub) => (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                                  {sub.subject_code}
                                </span>
                                <span className="font-semibold text-gray-800">{sub.subject_name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card Action Links */}
                    <div className="bg-gray-50/70 p-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center text-xs font-semibold">
                      <Link
                        to={`/faculty/students?class_id=${cls.id}`}
                        className="py-2 px-2 bg-white rounded-xl border border-gray-200 text-gray-700 hover:text-indigo-600 hover:border-indigo-300 transition shadow-sm"
                      >
                        Roster
                      </Link>
                      <Link
                        to="/faculty/exams"
                        className="py-2 px-2 bg-white rounded-xl border border-gray-200 text-gray-700 hover:text-indigo-600 hover:border-indigo-300 transition shadow-sm"
                      >
                        Exams
                      </Link>
                      <Link
                        to="/faculty/assignments"
                        className="py-2 px-2 bg-white rounded-xl border border-gray-200 text-gray-700 hover:text-indigo-600 hover:border-indigo-300 transition shadow-sm"
                      >
                        Homework
                      </Link>
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

export default MyClassesPage;
