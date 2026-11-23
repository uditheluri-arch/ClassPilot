import React, { useState, useEffect } from 'react';
import {
  getFacultyStudyMaterials,
  uploadStudyMaterial,
  getTeachingAssignments,
  getDownloadUrl,
} from '../../services/academicService';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  BookOpen,
  Plus,
  Download,
  ExternalLink,
  FileText,
  Calendar,
  X,
  AlertCircle,
  Link as LinkIcon,
} from 'lucide-react';

const FacultyStudyMaterialsPage = () => {
  const [materials, setMaterials] = useState([]);
  const [teachingAssignments, setTeachingAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [formData, setFormData] = useState({
    class_subject_id: '',
    title: '',
    description: '',
    material_type: 'DOCUMENT',
    external_link: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadSubmitting, setUploadSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [materialsData, teachData] = await Promise.all([
        getFacultyStudyMaterials(),
        getTeachingAssignments(),
      ]);
      setMaterials(materialsData);
      setTeachingAssignments(teachData);
      if (teachData.length > 0 && !formData.class_subject_id) {
        setFormData((prev) => ({
          ...prev,
          class_subject_id: teachData[0].class_subject_id,
        }));
      }
    } catch (err) {
      console.error('Failed to load study materials:', err);
      setError(err.response?.data?.detail || 'Failed to load study materials.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile && !formData.external_link.trim()) {
      setUploadError('Please provide either a file attachment or an external web link.');
      return;
    }

    try {
      setUploadSubmitting(true);
      setUploadError(null);

      const fData = new FormData();
      fData.append('class_subject_id', formData.class_subject_id);
      fData.append('title', formData.title.trim());
      fData.append('material_type', formData.material_type);
      if (formData.description.trim()) {
        fData.append('description', formData.description.trim());
      }
      if (formData.external_link.trim()) {
        fData.append('external_link', formData.external_link.trim());
      }
      if (selectedFile) {
        fData.append('file', selectedFile);
      }

      await uploadStudyMaterial(fData);
      setIsUploadOpen(false);
      setFormData({
        class_subject_id: teachingAssignments[0]?.class_subject_id || '',
        title: '',
        description: '',
        material_type: 'DOCUMENT',
        external_link: '',
      });
      setSelectedFile(null);
      fetchInitialData();
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError(err.response?.data?.detail || 'Failed to upload study material.');
    } finally {
      setUploadSubmitting(false);
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Study Materials Repository</h1>
          <p className="text-gray-500 text-sm mt-1">
            Distribute syllabus readings, lecture slides, worksheets, and reference guides to students.
          </p>
        </div>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Upload Material
        </button>
      </div>

      {error ? (
        <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200">{error}</div>
      ) : materials.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-800">No study materials uploaded</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Upload course readings, reference documents, or external resources for your students.
          </p>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
          >
            Upload First Resource
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {materials.map((mat) => {
            const date = new Date(mat.created_at);
            return (
              <div
                key={mat.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-semibold uppercase tracking-wider">
                      {mat.class_name} • {mat.subject_code}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[11px] font-medium uppercase">
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
                      <Calendar className="w-3 h-3" />
                      {date.toLocaleDateString()}
                    </span>
                    {mat.file_size_bytes && (
                      <span>{(mat.file_size_bytes / 1024).toFixed(1)} KB</span>
                    )}
                  </div>

                  {mat.file_filename && (
                    <a
                      href={getDownloadUrl('materials', mat.file_filename)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Attachment
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
                      Open Resource
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">Upload Study Material</h3>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Class & Subject Allocation
                </label>
                <select
                  value={formData.class_subject_id}
                  onChange={(e) =>
                    setFormData({ ...formData, class_subject_id: e.target.value })
                  }
                  required
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm"
                >
                  {teachingAssignments.map((ta) => (
                    <option key={ta.class_subject_id} value={ta.class_subject_id}>
                      {ta.class_name} - {ta.subject_name} ({ta.subject_code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Resource Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 4: Photosynthesis Notes & Formulas"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Material Type</label>
                <select
                  value={formData.material_type}
                  onChange={(e) =>
                    setFormData({ ...formData, material_type: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm"
                >
                  <option value="DOCUMENT">Document / PDF</option>
                  <option value="NOTES">Class Lecture Notes</option>
                  <option value="REFERENCE">Reference Guide</option>
                  <option value="WORKSHEET">Practice Worksheet</option>
                  <option value="LINK">External Web Link</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Description / Topic Outline
                </label>
                <textarea
                  rows={3}
                  placeholder="Key concepts covered, recommended reading order..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Upload Document File
                </label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p className="text-[11px] text-gray-400 mt-1">Supported: PDF, DOCX, TXT, ZIP, Images</p>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Or External Resource URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/syllabus-guide"
                  value={formData.external_link}
                  onChange={(e) =>
                    setFormData({ ...formData, external_link: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadSubmitting}
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {uploadSubmitting ? 'Uploading...' : 'Publish Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )}
</DashboardLayout>
);
};

export default FacultyStudyMaterialsPage;
