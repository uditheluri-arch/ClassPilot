import React, { useState, useEffect } from 'react';
import {
  getStudentAssignments,
  submitAssignment,
  getDownloadUrl,
} from '../../services/academicService';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  Download,
  Award,
  MessageSquare,
  X,
} from 'lucide-react';

const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');

  // Modal state
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStudentAssignments();
      setAssignments(data);
    } catch (err) {
      console.error('Failed to load assignments:', err);
      setError(err.response?.data?.detail || 'Failed to load assignments.');
    } finally {
      setLoading(false);
    }
  };

  const openSubmitModal = (assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionText(assignment.student_submission?.submission_text || '');
    setSelectedFile(null);
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const closeSubmitModal = () => {
    setSelectedAssignment(null);
    setSubmissionText('');
    setSelectedFile(null);
    setSubmitError(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!submissionText.trim() && !selectedFile) {
      setSubmitError('Please provide either written notes or upload a file.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);
      const formData = new FormData();
      if (submissionText.trim()) {
        formData.append('submission_text', submissionText.trim());
      }
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      await submitAssignment(selectedAssignment.id, formData);
      setSubmitSuccess(true);
      setTimeout(() => {
        closeSubmitModal();
        fetchAssignments();
      }, 1000);
    } catch (err) {
      console.error('Submission failed:', err);
      setSubmitError(err.response?.data?.detail || 'Failed to submit assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  const isOverdue = (dateStr) => new Date(dateStr) < new Date();

  const filteredAssignments = assignments.filter((a) => {
    if (activeTab === 'PENDING') return a.submission_status === 'PENDING';
    if (activeTab === 'SUBMITTED') return a.submission_status === 'SUBMITTED';
    if (activeTab === 'EVALUATED') return a.submission_status === 'EVALUATED';
    return true;
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Assignments & Coursework</h1>
              <p className="text-gray-500 text-sm mt-1">
                Access homework, submit solutions, and review faculty evaluations.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 gap-2">
            {['ALL', 'PENDING', 'SUBMITTED', 'EVALUATED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-3 text-sm font-semibold capitalize transition border-b-2 ${
                  activeTab === tab
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.toLowerCase()} ({assignments.filter((a) => tab === 'ALL' || a.submission_status === tab).length})
              </button>
            ))}
          </div>

          {/* Assignments List */}
          {error ? (
            <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200">{error}</div>
          ) : filteredAssignments.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-800">No assignments in this view</h3>
              <p className="text-sm text-gray-500 mt-1">Check back later or select another filter tab.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {filteredAssignments.map((assignment) => {
                const dueDate = new Date(assignment.due_date);
                const overdue = isOverdue(assignment.due_date);
                const sub = assignment.student_submission;

                return (
                  <div
                    key={assignment.id}
                    className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-semibold uppercase tracking-wider mb-1.5">
                          {assignment.subject_code} • {assignment.subject_name}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900">{assignment.title}</h3>
                        <p className="text-xs text-gray-400">Assigned by {assignment.created_by_name || 'Faculty'}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {assignment.submission_status === 'EVALUATED' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                            <Award className="w-3.5 h-3.5" />
                            Graded: {sub?.marks_obtained} / {assignment.max_marks}
                          </span>
                        )}
                        {assignment.submission_status === 'SUBMITTED' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Submitted
                          </span>
                        )}
                        {assignment.submission_status === 'PENDING' && (
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                              overdue
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            {overdue ? 'Overdue' : 'Pending Submission'}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50/50 p-3.5 rounded-xl border border-gray-100">
                      {assignment.description}
                    </p>

                    {/* Faculty Attachment if available */}
                    {assignment.has_attachment && assignment.attachment_filename && (
                      <div className="flex items-center gap-3 p-3 bg-indigo-50/40 rounded-xl border border-indigo-100 text-xs">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <span className="text-gray-700 font-medium truncate flex-1">
                          Resource: {assignment.attachment_filename}
                        </span>
                        <a
                          href={getDownloadUrl('assignments', assignment.attachment_filename)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition flex items-center gap-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </a>
                      </div>
                    )}

                    {/* Feedback Box if Evaluated */}
                    {assignment.submission_status === 'EVALUATED' && sub?.feedback && (
                      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                          <MessageSquare className="w-4 h-4" />
                          Teacher Feedback
                        </div>
                        <p className="text-emerald-800 leading-relaxed">{sub.feedback}</p>
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs">
                      <div className="flex items-center gap-4 text-gray-500">
                        <span>
                          Due: <strong>{dueDate.toLocaleString()}</strong>
                        </span>
                        <span>Max Marks: <strong>{assignment.max_marks}</strong></span>
                      </div>

                      {assignment.submission_status !== 'EVALUATED' && (
                        <button
                          onClick={() => openSubmitModal(assignment)}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          {assignment.submission_status === 'SUBMITTED' ? 'Update Submission' : 'Submit Solution'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Submission Modal */}
          {selectedAssignment && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Submit Assignment</h3>
                    <p className="text-xs text-gray-500">{selectedAssignment.title}</p>
                  </div>
                  <button
                    onClick={closeSubmitModal}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {submitSuccess ? (
                  <div className="p-6 text-center text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200">
                    <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <p className="font-bold">Assignment Submitted Successfully!</p>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-4">
                    {submitError && (
                      <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                        {submitError}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Written Notes / Online Text
                      </label>
                      <textarea
                        rows={4}
                        value={submissionText}
                        onChange={(e) => setSubmissionText(e.target.value)}
                        placeholder="Enter your answers, explanation, or code link..."
                        className="w-full text-sm border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Upload Solution Attachment (Optional)
                      </label>
                      <input
                        type="file"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                      <p className="text-[11px] text-gray-400 mt-1">Supported: PDF, DOCX, TXT, ZIP, Images (Max 15MB)</p>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t">
                      <button
                        type="button"
                        onClick={closeSubmitModal}
                        className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition disabled:opacity-50"
                      >
                        {submitting ? 'Submitting...' : 'Confirm Submission'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AssignmentsPage;
