import React, { useState, useEffect } from 'react';
import {
  getFacultyAssignments,
  createAssignment,
  getAssignmentSubmissions,
  evaluateSubmission,
  getTeachingAssignments,
  getDownloadUrl,
} from '../../services/academicService';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  FileText,
  Plus,
  Clock,
  CheckCircle,
  Download,
  Award,
  Users,
  X,
  AlertCircle,
} from 'lucide-react';

const AssignmentsManagementPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [teachingAssignments, setTeachingAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create Assignment Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    class_subject_id: '',
    title: '',
    description: '',
    due_date: '',
    max_marks: 100,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Submissions Modal
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submissionsError, setSubmissionsError] = useState(null);

  // Evaluation Sub-modal / form
  const [evaluatingSub, setEvaluatingSub] = useState(null);
  const [evalMarks, setEvalMarks] = useState('');
  const [evalFeedback, setEvalFeedback] = useState('');
  const [evalSubmitting, setEvalSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [assignmentsData, teachData] = await Promise.all([
        getFacultyAssignments(),
        getTeachingAssignments(),
      ]);
      setAssignments(assignmentsData);
      setTeachingAssignments(teachData);
      if (teachData.length > 0 && !formData.class_subject_id) {
        setFormData((prev) => ({
          ...prev,
          class_subject_id: teachData[0].class_subject_id,
        }));
      }
    } catch (err) {
      console.error('Failed to load assignments:', err);
      setError(err.response?.data?.detail || 'Failed to load assignments.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setCreateSubmitting(true);
      setCreateError(null);

      const fData = new FormData();
      fData.append('class_subject_id', formData.class_subject_id);
      fData.append('title', formData.title.trim());
      fData.append('description', formData.description.trim());
      fData.append('due_date', new Date(formData.due_date).toISOString());
      fData.append('max_marks', formData.max_marks);
      if (selectedFile) {
        fData.append('file', selectedFile);
      }

      await createAssignment(fData);
      setIsCreateOpen(false);
      setFormData({
        class_subject_id: teachingAssignments[0]?.class_subject_id || '',
        title: '',
        description: '',
        due_date: '',
        max_marks: 100,
      });
      setSelectedFile(null);
      fetchInitialData();
    } catch (err) {
      console.error('Create assignment failed:', err);
      setCreateError(err.response?.data?.detail || 'Failed to create assignment.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const openSubmissionsModal = async (assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionsError(null);
    setEvaluatingSub(null);
    try {
      setLoadingSubmissions(true);
      const data = await getAssignmentSubmissions(assignment.id);
      setSubmissions(data);
    } catch (err) {
      console.error('Failed to load submissions:', err);
      setSubmissionsError(err.response?.data?.detail || 'Failed to load student submissions.');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const startEvaluate = (sub) => {
    setEvaluatingSub(sub);
    setEvalMarks(sub.marks_obtained !== null ? sub.marks_obtained : '');
    setEvalFeedback(sub.feedback || '');
  };

  const handleSaveEvaluation = async (e) => {
    e.preventDefault();
    try {
      setEvalSubmitting(true);
      const val = Number(evalMarks);
      if (val < 0 || (selectedAssignment.max_marks && val > selectedAssignment.max_marks)) {
        alert(`Marks must be between 0 and ${selectedAssignment.max_marks}`);
        return;
      }

      const updated = await evaluateSubmission(evaluatingSub.id, {
        marks_obtained: val,
        feedback: evalFeedback.trim(),
      });

      setSubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setEvaluatingSub(null);
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save evaluation.');
    } finally {
      setEvalSubmitting(false);
    }
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#172033]">Assignment Management</h1>
              <p className="text-sm text-[#64748B] mt-1">
                Create coursework, collect student submissions, and record grades with feedback.
              </p>
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#315E91] text-white font-medium text-sm rounded-md hover:bg-[#264D78] transition shadow-xs self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              Create Assignment
            </button>
          </div>

          {error ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">{error}</div>
          ) : assignments.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] rounded-md p-10 text-center">
              <FileText className="w-10 h-10 text-[#64748B] mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-[#172033]">No assignments created</h3>
              <p className="text-xs text-[#64748B] mt-1 mb-4">
                Assign coursework, problem sets, or projects for your assigned classes.
              </p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-4 py-2 bg-[#315E91] text-white text-xs font-medium rounded-md hover:bg-[#264D78] transition"
              >
                Create First Assignment
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {assignments.map((assignment) => {
                const dueDate = new Date(assignment.due_date);
                return (
                  <div
                    key={assignment.id}
                    className="bg-white rounded-md border border-[#E2E8F0] p-5 shadow-xs hover:border-[#315E91]/40 transition space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="inline-block px-2 py-0.5 bg-[#F0F5FA] text-[#315E91] border border-[#C3D9EB] rounded text-xs font-semibold">
                          {assignment.class_name} • {assignment.subject_name}
                        </span>
                        <span className="text-xs text-[#64748B] font-medium">
                          Max: {assignment.max_marks} pts
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-[#172033]">{assignment.title}</h3>

                      <p className="text-xs text-[#64748B] leading-relaxed line-clamp-3 bg-[#F7F8FA] p-3 rounded border border-[#E2E8F0]">
                        {assignment.description}
                      </p>

                      {assignment.has_attachment && assignment.attachment_filename && (
                        <div className="flex items-center gap-2 p-2 bg-[#F0F5FA] border border-[#C3D9EB] rounded text-xs text-[#315E91]">
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate flex-1 font-medium">{assignment.attachment_filename}</span>
                          <a
                            href={getDownloadUrl('assignments', assignment.attachment_filename)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#315E91] hover:underline font-semibold"
                          >
                            Download
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-[#E2E8F0] space-y-3 text-xs">
                      <div className="flex items-center justify-between text-[#64748B]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                          Due: {dueDate.toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1 font-medium text-[#315E91]">
                          <Users className="w-3.5 h-3.5" />
                          {assignment.total_submissions} of {assignment.total_students} submitted
                        </span>
                      </div>

                      <button
                        onClick={() => openSubmissionsModal(assignment)}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#F0F5FA] text-[#315E91] border border-[#C3D9EB] font-medium rounded-md hover:bg-[#E1EDF7] transition"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Review Submissions ({assignment.total_submissions})
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Create Modal */}
          {isCreateOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
              <div className="bg-white rounded-md border border-[#E2E8F0] max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                  <h3 className="text-base font-bold text-[#172033]">Create New Assignment</h3>
                  <button
                    onClick={() => setIsCreateOpen(false)}
                    className="text-[#64748B] hover:text-[#172033] p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {createError && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-md border border-red-200">
                    {createError}
                  </div>
                )}

                <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-[#172033] mb-1">
                      Class & Subject Allocation
                    </label>
                    <select
                      value={formData.class_subject_id}
                      onChange={(e) =>
                        setFormData({ ...formData, class_subject_id: e.target.value })
                      }
                      required
                      className="w-full border border-[#E2E8F0] rounded-md p-2.5 text-sm bg-[#F7F8FA] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#315E91] focus:border-[#315E91]"
                    >
                      {teachingAssignments.map((ta) => (
                        <option key={ta.class_subject_id} value={ta.class_subject_id}>
                          {ta.class_name} - {ta.subject_name} ({ta.subject_code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#172033] mb-1">Assignment Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Problem Set 3: Matrix Operations"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full border border-[#E2E8F0] rounded-md p-2.5 text-sm bg-[#F7F8FA] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#315E91] focus:border-[#315E91]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#172033] mb-1">Description & Tasks</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Detail instructions, problem statements, or criteria..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full border border-[#E2E8F0] rounded-md p-2.5 text-sm bg-[#F7F8FA] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#315E91] focus:border-[#315E91]"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#172033] mb-1">Due Date</label>
                      <input
                        type="date"
                        required
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                        className="w-full border border-[#E2E8F0] rounded-md p-2.5 text-sm bg-[#F7F8FA] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#315E91] focus:border-[#315E91]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#172033] mb-1">Maximum Marks</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.max_marks}
                        onChange={(e) => setFormData({ ...formData, max_marks: e.target.value })}
                        className="w-full border border-[#E2E8F0] rounded-md p-2.5 text-sm bg-[#F7F8FA] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#315E91] focus:border-[#315E91]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#172033] mb-1">
                      Attach Reference Document (Optional)
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      className="w-full text-xs text-[#64748B] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-[#F0F5FA] file:text-[#315E91] hover:file:bg-[#E1EDF7]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
                    <button
                      type="button"
                      onClick={() => setIsCreateOpen(false)}
                      className="px-4 py-2 font-medium text-[#64748B] hover:text-[#172033] rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createSubmitting}
                      className="px-4 py-2 font-medium text-white bg-[#315E91] hover:bg-[#264D78] rounded-md transition disabled:opacity-50"
                    >
                      {createSubmitting ? 'Publishing...' : 'Publish Assignment'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Submissions & Evaluation Modal */}
          {selectedAssignment && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
              <div className="bg-white rounded-md border border-[#E2E8F0] max-w-3xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 shrink-0">
                  <div>
                    <h3 className="text-base font-bold text-[#172033]">Student Submissions</h3>
                    <p className="text-xs text-[#64748B]">
                      {selectedAssignment.title} ({selectedAssignment.class_name} • Max Marks:{' '}
                      {selectedAssignment.max_marks})
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedAssignment(null)}
                    className="text-[#64748B] hover:text-[#172033] p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {loadingSubmissions ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#315E91]"></div>
                  </div>
                ) : submissionsError ? (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-md">{submissionsError}</div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-10 text-[#64748B] text-xs">
                    <Users className="w-8 h-8 text-[#64748B] mx-auto mb-2" />
                    No submissions received for this assignment yet.
                  </div>
                ) : (
                  <div className="overflow-y-auto flex-1 space-y-3 pr-1">
                    {submissions.map((sub) => {
                      const subDate = new Date(sub.submitted_at);
                      const isGraded = sub.status === 'EVALUATED';

                      return (
                        <div
                          key={sub.id}
                          className="p-4 rounded-md border border-[#E2E8F0] bg-[#F7F8FA] space-y-3 text-xs"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="font-mono font-bold text-[#315E91] mr-2">
                                {sub.student_roll_number}
                              </span>
                              <span className="font-semibold text-[#172033]">{sub.student_name}</span>
                              <span className="text-[#64748B] block text-[11px] mt-0.5">
                                Submitted: {subDate.toLocaleString()}
                              </span>
                            </div>

                            <div>
                              {isGraded ? (
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-semibold">
                                  Score: {sub.marks_obtained} / {sub.max_marks}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs font-semibold">
                                  Needs Grading
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Submission text */}
                          {sub.submission_text && (
                            <div className="p-3 bg-white rounded border border-[#E2E8F0] text-[#172033] whitespace-pre-wrap">
                              {sub.submission_text}
                            </div>
                          )}

                          {/* Attachment download */}
                          {sub.has_attachment && sub.attachment_filename && (
                            <div className="flex items-center gap-2">
                              <a
                                href={getDownloadUrl('submissions', sub.attachment_filename)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#C3D9EB] text-[#315E91] font-medium rounded hover:bg-[#F0F5FA]"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Download: {sub.attachment_filename}
                              </a>
                            </div>
                          )}

                          {/* Feedback display */}
                          {isGraded && sub.feedback && (
                            <div className="p-2.5 bg-white border border-[#E2E8F0] text-[#172033] rounded">
                              <span className="font-semibold text-[#64748B]">Feedback: </span>
                              {sub.feedback}
                            </div>
                          )}

                          {/* Evaluation trigger / inline form */}
                          {evaluatingSub?.id === sub.id ? (
                            <form
                              onSubmit={handleSaveEvaluation}
                              className="p-3 bg-white rounded border border-[#315E91] space-y-3"
                            >
                              <div className="flex items-center gap-3">
                                <div>
                                  <label className="block text-[11px] font-semibold text-[#172033] mb-1">
                                    Marks (Max: {selectedAssignment.max_marks})
                                  </label>
                                  <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    max={selectedAssignment.max_marks}
                                    required
                                    value={evalMarks}
                                    onChange={(e) => setEvalMarks(e.target.value)}
                                    className="w-24 border border-[#E2E8F0] rounded p-1.5 font-bold text-xs"
                                  />
                                </div>
                                <div className="flex-1">
                                  <label className="block text-[11px] font-semibold text-[#172033] mb-1">
                                    Feedback / Comments
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Evaluator feedback..."
                                    value={evalFeedback}
                                    onChange={(e) => setEvalFeedback(e.target.value)}
                                    className="w-full border border-[#E2E8F0] rounded p-1.5 text-xs"
                                  />
                                </div>
                              </div>

                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEvaluatingSub(null)}
                                  className="px-3 py-1 bg-[#F7F8FA] border border-[#E2E8F0] rounded text-[#64748B] hover:text-[#172033]"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  disabled={evalSubmitting}
                                  className="px-3 py-1 bg-[#315E91] text-white font-medium rounded hover:bg-[#264D78]"
                                >
                                  {evalSubmitting ? 'Saving...' : 'Save Grade'}
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div className="flex justify-end">
                              <button
                                onClick={() => startEvaluate(sub)}
                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#315E91] text-white rounded text-xs font-medium hover:bg-[#264D78]"
                              >
                                <Award className="w-3.5 h-3.5" />
                                {isGraded ? 'Edit Grade' : 'Grade Submission'}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex justify-end border-t border-[#E2E8F0] pt-3 shrink-0">
                  <button
                    onClick={() => setSelectedAssignment(null)}
                    className="px-4 py-2 text-xs font-medium text-[#64748B] hover:text-[#172033] rounded-md"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AssignmentsManagementPage;
