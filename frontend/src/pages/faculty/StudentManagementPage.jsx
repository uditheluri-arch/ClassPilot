import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  getFacultyClasses,
  getClassStudents,
  searchStudents,
} from '../../services/academicService';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Search, Users, CheckCircle, XCircle, Filter, AlertCircle } from 'lucide-react';

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
          <h1 className="text-2xl font-bold text-[#172033]">Student Directory & Rosters</h1>
          <p className="text-sm text-[#64748B] mt-1">
            Search students across assigned academic cohorts and review enrollment status.
          </p>
        </div>

        {/* Controls Bar */}
        <div className="bg-white p-4 rounded-md border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Class Filter */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <Filter className="w-4 h-4 text-[#64748B] shrink-0" />
            <select
              value={selectedClassId}
              onChange={handleClassChange}
              className="w-full md:w-72 text-sm bg-[#F7F8FA] border border-[#E2E8F0] rounded-md px-3 py-2 text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#315E91] focus:border-[#315E91]"
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
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by roll number or name..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-[#F7F8FA] border border-[#E2E8F0] rounded-md text-[#172033] placeholder-[#64748B] focus:outline-none focus:ring-1 focus:ring-[#315E91] focus:border-[#315E91]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-[#315E91] text-white text-sm font-medium rounded-md hover:bg-[#264D78] transition shrink-0"
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
                className="px-3 py-2 text-xs font-medium text-[#64748B] hover:text-[#172033] bg-[#F7F8FA] border border-[#E2E8F0] rounded-md transition"
              >
                Reset
              </button>
            )}
          </form>
        </div>

        {/* Roster Table */}
        <div className="bg-white rounded-md border border-[#E2E8F0] overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#172033]">
              {isSearching
                ? `Search Results for "${searchQuery}" (${students.length})`
                : `Enrolled Students (${students.length})`}
            </h2>
            <span className="text-xs text-[#64748B]">Official Registry</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#315E91]"></div>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600 text-sm">
              <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
              {error}
            </div>
          ) : students.length === 0 ? (
            <div className="p-10 text-center text-[#64748B]">
              <Users className="w-10 h-10 text-[#64748B] mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-[#172033]">No students found</h3>
              <p className="text-xs text-[#64748B] mt-1">
                {isSearching
                  ? 'No students matching the query within your assigned classes.'
                  : 'No students currently enrolled in this class.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F7F8FA] text-[#64748B] text-xs font-semibold border-b border-[#E2E8F0]">
                    <th className="py-3 px-6">Roll Number</th>
                    <th className="py-3 px-6">Full Name</th>
                    <th className="py-3 px-6">Class & Section</th>
                    <th className="py-3 px-6">Email Address</th>
                    <th className="py-3 px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-sm">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-[#F7F8FA] transition">
                      <td className="py-3.5 px-6 font-mono font-bold text-[#315E91]">
                        {student.roll_number}
                      </td>
                      <td className="py-3.5 px-6 font-medium text-[#172033]">
                        {student.full_name}
                      </td>
                      <td className="py-3.5 px-6 text-xs text-[#64748B]">
                        {student.class_name ? `${student.class_name} - Sec ${student.section || 'A'}` : 'Unassigned'}
                      </td>
                      <td className="py-3.5 px-6 text-xs text-[#64748B] font-mono">
                        {student.email || 'N/A'}
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        {student.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded text-xs font-medium">
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
