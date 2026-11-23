import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  getFacultyClasses,
  getClassStudents,
  searchStudents,
} from '../../services/academicService';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Search, Users, CheckCircle, XCircle, Filter, BookOpen, AlertCircle } from 'lucide-react';

const StudentManagementPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialClassId = searchParams.get('class_id') || '';

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(initialClassId);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (classes.length > 0) {
      if (selectedClassId) {
        fetchClassRoster(selectedClassId);
      } else {
        setSelectedClassId(classes[0].id.toString());
        fetchClassRoster(classes[0].id);
      }
    }
  }, [classes, selectedClassId]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const data = await getFacultyClasses();
      setClasses(data);
      if (data.length === 0) {
        setLoading(false);
      }
    } catch (err) {
      console.error('Failed to load classes:', err);
      setError(err.response?.data?.detail || 'Failed to load assigned classes.');
      setLoading(false);
    }
  };

  const fetchClassRoster = async (classId) => {
    try {
      setLoading(true);
      setError(null);
      setIsSearching(false);
      const data = await getClassStudents(classId);
      setStudents(data);
    } catch (err) {
      console.error('Failed to load students:', err);
      setError(err.response?.data?.detail || 'Failed to load student roster.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      if (selectedClassId) {
        fetchClassRoster(selectedClassId);
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setIsSearching(true);
      const results = await searchStudents(searchQuery.trim());
      setStudents(results);
    } catch (err) {
      console.error('Search failed:', err);
      setError(err.response?.data?.detail || 'Search query failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleClassChange = (e) => {
    const newClassId = e.target.value;
    setSelectedClassId(newClassId);
    setSearchParams({ class_id: newClassId });
    setSearchQuery('');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Student Directory & Rosters</h1>
          <p className="text-gray-500 text-sm mt-1">
            Search students across your cohorts and inspect enrollment information.
          </p>
        </div>

        {/* Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Class Filter */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={selectedClassId}
              onChange={handleClassChange}
              className="w-full md:w-64 text-sm font-medium bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} - Section {c.section || 'A'} ({c.student_count} students)
                </option>
              ))}
            </select>
          </div>

          {/* Roll Number Search */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-96">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by roll number or name..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-xl hover:bg-indigo-700 transition shrink-0"
            >
              Search
            </button>
            {isSearching && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  if (selectedClassId) fetchClassRoster(selectedClassId);
                }}
                className="px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 bg-gray-100 rounded-xl"
              >
                Reset
              </button>
            )}
          </form>
        </div>

        {/* Roster Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">
              {isSearching
                ? `Search Results for "${searchQuery}" (${students.length})`
                : `Enrolled Students (${students.length})`}
            </h2>
            <span className="text-xs text-gray-400">ClassPilot Official Registry</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600 text-sm">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              {error}
            </div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-800">No students found</h3>
              <p className="text-xs text-gray-500 mt-1">
                {isSearching
                  ? 'No students matching the query within your assigned classes.'
                  : 'No students currently enrolled in this class.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
                    <th className="py-3 px-6">Roll Number</th>
                    <th className="py-3 px-6">Full Name</th>
                    <th className="py-3 px-6">Class & Section</th>
                    <th className="py-3 px-6">Email Address</th>
                    <th className="py-3 px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50/70 transition">
                      <td className="py-4 px-6 font-mono font-bold text-indigo-700">
                        {student.roll_number}
                      </td>
                      <td className="py-4 px-6 font-semibold text-gray-900">
                        {student.full_name}
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-600">
                        {student.class_name ? `${student.class_name} - Sec ${student.section || 'A'}` : 'Unassigned'}
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-500 font-mono">
                        {student.email || 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {student.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-50 text-red-700 rounded-full text-xs font-semibold">
                            <XCircle className="w-3 h-3" />
                            Inactive
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentManagementPage;
