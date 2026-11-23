import React, { useState, useEffect } from 'react';
import { getStudentStudyMaterials, getDownloadUrl } from '../../services/academicService';
import DashboardLayout from '../../layouts/DashboardLayout';
import { BookOpen, FileText, Download, ExternalLink, Filter, Calendar, User, Search } from 'lucide-react';

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
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Study Materials & Notes</h1>
            <p className="text-gray-500 text-sm mt-1">
              Handouts, lecture notes, formula sheets, and references provided by your teachers.
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes, chapters, topics..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
            </div>

            {/* Subject Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {subjectList.map((code) => (
                <button
                  key={code}
                  onClick={() => setSelectedSubject(code)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    selectedSubject === code
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {code === 'ALL' ? 'All Subjects' : code}
                </button>
              ))}
            </div>
          </div>

          {/* Materials List */}
          {error ? (
            <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200">{error}</div>
          ) : filteredMaterials.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-800">No study materials found</h3>
              <p className="text-sm text-gray-500 mt-1">
                {searchQuery
                  ? 'Try adjusting your search terms or subject filter.'
                  : 'Your faculty will upload resources here as the course progresses.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMaterials.map((mat) => {
                const date = new Date(mat.created_at);
                return (
                  <div
                    key={mat.id}
                    className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-semibold">
                          {mat.subject_code}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[11px] font-medium uppercase tracking-wider">
                          {mat.material_type}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-gray-900 line-clamp-1">{mat.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{mat.subject_name}</p>
                      </div>

                      {mat.description && (
                        <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                          {mat.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-gray-100 space-y-3">
                      <div className="flex items-center justify-between text-[11px] text-gray-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {mat.uploaded_by_name || 'Faculty'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {date.toLocaleDateString()}
                        </span>
                      </div>

                      {mat.file_filename && (
                        <a
                          href={getDownloadUrl('materials', mat.file_filename)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download File
                        </a>
                      )}

                      {!mat.file_filename && mat.external_link && (
                        <a
                          href={mat.external_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold hover:bg-blue-100 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open Resource Link
                        </a>
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

export default StudyMaterialsPage;
