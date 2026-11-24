import React, { useState, useEffect } from 'react';
import {
  getStudentAssignments,
  submitAssignment,
  getDownloadUrl,
} from '../../services/academicService';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  Download,
  AlertCircle,
  Loader2,
  X,
  FileText
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

  const handleOpenSubmit = (assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionText('');
    setSelectedFile(null);
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submissionText.trim() && !selectedFile) {
      setSubmitError('Please provide either written notes or an uploaded document.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);
      await submitAssignment(selectedAssignment.id, submissionText, selectedFile);
      setSubmitSuccess(true);
      await fetchAssignments();
      setTimeout(() => {
        setSelectedAssignment(null);
      }, 1000);
    } catch (err) {
      setSubmitError(err.response?.data?.detail || 'Submission could not be recorded.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = assignments.filter((a) => {
    if (activeTab === 'PENDING') return a.submission_status === 'PENDING';
    if (activeTab === 'SUBMITTED') return a.submission_status === 'SUBMITTED';
    return true;
  });

  return (
    <DashboardLayout>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#64748B]">
          <Loader2 className="w-6 h-6 animate-spin text-[#315E91] mb-2" />
          <p className="text-sm">Loading Course Assignments...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
                Coursework & Assignments
              </h1>
              <p className="text-sm text-[#64748B] mt-1">
                Deadlines, homework attachments, and submission tracking.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'ALL'
                  ? 'bg-[#315E91] text-white'
                  : 'text-[#64748B] hover:text-[#172033] hover:bg-slate-100'
              }`}
            >
              All Assignments ({assignments.length})
            </button>
            <button
              onClick={() => setActiveTab('PENDING')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'PENDING'
                  ? 'bg-[#315E91] text-white'
                  : 'text-[#64748B] hover:text-[#172033] hover:bg-slate-100'
              }`}
            >
              Pending Submissions
            </button>
            <button
              onClick={() => setActiveTab('SUBMITTED')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'SUBMITTED'
                  ? 'bg-[#315E91] text-white'
                  : 'text-[#64748B] hover:text-[#172033] hover:bg-slate-100'
              }`}
            >
              Submitted Tasks
            </button>
          </div>

          {/* Assignments Table */}
          <div className="bg-white border border-[#E2E8F0] rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-slate-50/50 text-xs font-semibold text-[#64748B]">
                    <th className="py-2.5 px-4">Subject</th>
                    <th className="py-2.5 px-4">Assignment Title</th>
                    <th className="py-2.5 px-4">Deadline</th>
                    <th className="py-2.5 px-4">Max Marks</th>
                    <th className="py-2.5 px-4">Reference File</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-sm">
                  {filtered.length > 0 ? (
                    filtered.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-[#172033] block">{item.subject_name}</span>
                          <span className="text-xs font-mono text-[#64748B]">{item.subject_code}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-[#172033] block">{item.title}</span>
                          <span className="text-xs text-[#64748B] line-clamp-1">{item.description}</span>
                        </td>
                        <td className="py-3 px-4 text-xs font-mono text-[#172033]">
                          {new Date(item.due_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-[#172033]">
                          {item.max_marks}
                        </td>
                        <td className="py-3 px-4">
                          {item.attachment_path ? (
                            <a
                              href={getDownloadUrl(item.attachment_path)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-medium text-[#315E91] hover:underline inline-flex items-center gap-1"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Attachment
                            </a>
                          ) : (
                            <span className="text-xs text-[#94A3B8]">None</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded border ${
                              item.submission_status === 'SUBMITTED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {item.submission_status === 'SUBMITTED' ? 'Submitted' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleOpenSubmit(item)}
                            className="px-3 py-1.5 text-xs font-medium rounded-md bg-[#315E91] text-white hover:bg-[#264D78] transition-colors"
                          >
                            {item.submission_status === 'SUBMITTED' ? 'Resubmit' : 'Submit Work'}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-xs text-[#64748B]">
                        No coursework items match the current filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-md max-w-lg w-full p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div>
                <h2 className="text-base font-bold text-[#172033]">Submit Assignment</h2>
                <p className="text-xs text-[#64748B]">{selectedAssignment.title} • {selectedAssignment.subject_name}</p>
              </div>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="text-[#64748B] hover:text-[#172033]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                {submitError}
              </div>
            )}

            {submitSuccess && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded">
                Work successfully submitted.
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#172033] mb-1">
                  Submission Notes / Text Response
                </label>
                <textarea
                  rows={4}
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Enter your notes, written answers, or repository link..."
                  className="w-full p-2.5 text-xs sm:text-sm border border-[#E2E8F0] rounded-md focus:outline-none focus:ring-1 focus:ring-[#315E91] focus:border-[#315E91]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#172033] mb-1">
                  Attach File (PDF, DOCX, ZIP, or Image)
                </label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full text-xs text-[#64748B] file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-[#E2E8F0] file:text-xs file:font-medium file:bg-[#F0F5FA] file:text-[#315E91] hover:file:bg-[#E1ECF5]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setSelectedAssignment(null)}
                  className="px-3 py-1.5 text-xs font-medium border border-[#E2E8F0] rounded-md text-[#64748B] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 text-xs font-medium bg-[#315E91] text-white rounded-md hover:bg-[#264D78] disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Confirm Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AssignmentsPage;
