import React, { useState, useEffect } from 'react';
import { getFacultyClasses, getTeachingAssignments } from '../../services/academicService';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Users, GraduationCap, ArrowRight } from 'lucide-react';
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
          <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-[#315E91]"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-[#172033]">Assigned Classes & Subjects</h1>
            <p className="text-sm text-[#64748B] mt-1">
              Manage coursework, examination schedules, and student rosters for your academic cohorts.
            </p>
          </div>

          {error ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">
              {error}
            </div>
          ) : classes.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] rounded-md p-10 text-center">
              <GraduationCap className="w-10 h-10 text-[#64748B] mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-[#172033]">No classes currently assigned</h3>
              <p className="text-xs text-[#64748B] mt-1">
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
                    className="bg-white rounded-md border border-[#E2E8F0] shadow-sm flex flex-col justify-between"
                  >
                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="inline-block px-2 py-0.5 bg-[#F0F5FA] text-[#315E91] border border-[#C3D9EB] rounded text-xs font-semibold mb-1.5">
                            Section {cls.section || 'A'}
                          </span>
                          <h2 className="text-xl font-bold text-[#172033]">{cls.name}</h2>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#F7F8FA] border border-[#E2E8F0] rounded text-xs font-medium text-[#64748B]">
                          <Users className="w-3.5 h-3.5" />
                          <span>{cls.student_count} Students</span>
                        </div>
                      </div>

                      <p className="text-xs text-[#64748B] leading-relaxed">
                        {cls.description || 'Assigned academic teaching cohort.'}
                      </p>

                      {/* Teaching Subjects */}
                      <div className="pt-2 border-t border-[#E2E8F0]">
                        <h3 className="text-xs font-semibold text-[#64748B] mb-2.5">
                          Assigned Subjects ({classSubjects.length})
                        </h3>
                        <div className="space-y-2">
                          {classSubjects.map((sub) => (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between p-2.5 bg-[#F7F8FA] rounded border border-[#E2E8F0] text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-[#315E91] bg-white border border-[#C3D9EB] px-2 py-0.5 rounded">
                                  {sub.subject_code}
                                </span>
                                <span className="font-medium text-[#172033]">{sub.subject_name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card Action Links */}
                    <div className="bg-[#F7F8FA] p-3 border-t border-[#E2E8F0] grid grid-cols-3 gap-2 text-center text-xs font-medium">
                      <Link
                        to={`/faculty/students?class_id=${cls.id}`}
                        className="py-1.5 px-2 bg-white rounded border border-[#E2E8F0] text-[#172033] hover:text-[#315E91] hover:border-[#315E91] transition shadow-xs"
                      >
                        Roster
                      </Link>
                      <Link
                        to="/faculty/exams"
                        className="py-1.5 px-2 bg-white rounded border border-[#E2E8F0] text-[#172033] hover:text-[#315E91] hover:border-[#315E91] transition shadow-xs"
                      >
                        Exams
                      </Link>
                      <Link
                        to="/faculty/assignments"
                        className="py-1.5 px-2 bg-white rounded border border-[#E2E8F0] text-[#172033] hover:text-[#315E91] hover:border-[#315E91] transition shadow-xs"
                      >
                        Coursework
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
