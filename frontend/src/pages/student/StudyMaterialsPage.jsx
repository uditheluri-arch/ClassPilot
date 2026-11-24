import React, { useState, useEffect } from 'react';
import { getStudentStudyMaterials, getDownloadUrl } from '../../services/academicService';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Download, AlertCircle, Loader2, Search } from 'lucide-react';

const StudyMaterialsPage = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStudentStudyMaterials();
      setMaterials(data);
    } catch (err) {
      console.error('Failed to load study materials:', err);
      setError(err.response?.data?.detail || 'Failed to load study materials.');
    } finally {
      setLoading(false);
    }
  };

  const subjectList = ['ALL', ...new Set(materials.map((m) => m.subject_code))];

  const filteredMaterials = materials.filter((item) => {
    const matchesSubject = selectedSubject === 'ALL' || item.subject_code === selectedSubject;
    const matchesQuery =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.subject_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesQuery;
  });

  return (
    <DashboardLayout>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#64748B]">
          <Loader2 className="w-6 h-6 animate-spin text-[#315E91] mb-2" />
          <p className="text-sm">Loading Study Materials...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
              Study Materials & Resources
            </h1>
            <p className="text-sm text-[#64748B] mt-1">
              Lecture slides, syllabus documents, and coursework references uploaded by instructors.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Search & Subject Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources by title or topic..."
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-[#E2E8F0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#315E91] focus:border-[#315E91]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-[#64748B] whitespace-nowrap">Filter Subject:</span>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="bg-white border border-[#E2E8F0] rounded-md px-3 py-1.5 text-xs text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#315E91]"
              >
                {subjectList.map((code) => (
                  <option key={code} value={code}>
                    {code === 'ALL' ? 'All Subjects' : code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Materials Table */}
          <div className="bg-white border border-[#E2E8F0] rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-slate-50/50 text-xs font-semibold text-[#64748B]">
                    <th className="py-2.5 px-4">Subject</th>
                    <th className="py-2.5 px-4">Document Title</th>
                    <th className="py-2.5 px-4">Description</th>
                    <th className="py-2.5 px-4">Uploaded By</th>
                    <th className="py-2.5 px-4">Date Added</th>
                    <th className="py-2.5 px-4 text-right">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-sm">
                  {filteredMaterials.length > 0 ? (
                    filteredMaterials.map((mat) => (
                      <tr key={mat.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-[#172033] block">{mat.subject_name}</span>
                          <span className="text-xs font-mono text-[#64748B]">{mat.subject_code}</span>
                        </td>
                        <td className="py-3 px-4 font-medium text-[#172033]">
                          {mat.title}
                        </td>
                        <td className="py-3 px-4 text-xs text-[#64748B] max-w-xs">
                          {mat.description || 'No description provided'}
                        </td>
                        <td className="py-3 px-4 text-xs text-[#64748B]">
                          {mat.uploaded_by_name || 'Faculty Instructor'}
                        </td>
                        <td className="py-3 px-4 text-xs font-mono text-[#64748B]">
                          {mat.created_at ? new Date(mat.created_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {mat.file_path ? (
                            <a
                              href={getDownloadUrl(mat.file_path)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-[#F0F5FA] text-[#315E91] border border-[#C3D9EB] rounded hover:bg-[#E1ECF5] transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </a>
                          ) : (
                            <span className="text-xs text-[#94A3B8]">No file</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-xs text-[#64748B]">
                        No study materials available matching your criteria.
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

export default StudyMaterialsPage;
