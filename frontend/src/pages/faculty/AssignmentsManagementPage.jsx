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
  MessageSquare,
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
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Assignment Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create tasks, receive student submissions, and deliver grades with feedback.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Assignment
        </button>
      </div>

      {error ? (
        <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200">{error}</div>
      ) : assignments.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-800">No assignments created</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Assign coursework, coding tasks, or problem sets for your classes.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
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
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-block px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-semibold uppercase tracking-wider">
                      {assignment.class_name} • {assignment.subject_name}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      Max: {assignment.max_marks} pts
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900">{assignment.title}</h3>

                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                    {assignment.description}
                  </p>

                  {assignment.has_attachment && assignment.attachment_filename && (
                    <div className="flex items-center gap-2 p-2 bg-blue-50/60 rounded-lg text-xs text-blue-800">
                      <FileText className="w-3.5 h-3.5" />
                      <span className="truncate flex-1">{assignment.attachment_filename}</span>
                      <a
                        href={getDownloadUrl('assignments', assignment.attachment_filename)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline font-semibold"
                      >
                        Download
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 space-y-3 text-xs">
                  <div className="flex items-center justify-between text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      Due: {dueDate.toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-indigo-600">
                      <Users className="w-3.5 h-3.5" />
                      {assignment.total_submissions} of {assignment.total_students} submitted
                    </span>
                  </div>

                  <button
                    onClick={() => openSubmissionsModal(assignment)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-100 transition"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Review & Grade Submissions ({assignment.total_submissions})
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">Create New Assignment</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
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
                <label className="block font-semibold text-gray-700 mb-1">Assignment Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Problem Set 3: Matrix Operations"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description & Tasks</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail the instructions, problem statements, or submission criteria..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Maximum Marks</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.max_marks}
                    onChange={(e) => setFormData({ ...formData, max_marks: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Attach Problem Sheet / Reference (Optional)
                </label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {createSubmitting ? 'Creating...' : 'Publish Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submissions & Evaluation Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Student Submissions</h3>
                <p className="text-xs text-gray-500">
                  {selectedAssignment.title} ({selectedAssignment.class_name} • Max Marks:{' '}
                  {selectedAssignment.max_marks})
                </p>
              </div>
              <button
                onClick={() => setSelectedAssignment(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingSubmissions ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : submissionsError ? (
              <div className="p-4 bg-red-50 text-red-700 text-xs rounded-xl">{submissionsError}</div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-xs">
                <Users className="w-10 h-10 text-gray-400 mx-auto mb-2" />
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
                      className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3 text-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-mono font-bold text-indigo-700 mr-2">
                            {sub.student_roll_number}
                          </span>
                          <span className="font-bold text-gray-900">{sub.student_name}</span>
                          <span className="text-gray-400 block text-[11px] mt-0.5">
                            Submitted: {subDate.toLocaleString()}
                          </span>
                        </div>

                        <div>
                          {isGraded ? (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold">
                              Score: {sub.marks_obtained} / {sub.max_marks}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-bold">
                              Needs Grading
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Submission text */}
                      {sub.submission_text && (
                        <div className="p-3 bg-white rounded-lg border border-gray-200 text-gray-800 whitespace-pre-wrap">
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
                            className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-100"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download Student File: {sub.attachment_filename}
                          </a>
                        </div>
                      )}

                      {/* Feedback display */}
                      {isGraded && sub.feedback && (
                        <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-200">
                          <span className="font-bold">Your Feedback: </span>
                          {sub.feedback}
                        </div>
                      )}

                      {/* Evaluation trigger / inline form */}
                      {evaluatingSub?.id === sub.id ? (
                        <form
                          onSubmit={handleSaveEvaluation}
                          className="p-3 bg-white rounded-xl border border-indigo-200 space-y-3"
                        >
                          <div className="flex items-center gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-gray-700 mb-1">
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
                                className="w-24 border border-gray-300 rounded-lg p-1.5 font-bold"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                Feedback / Notes
                              </label>
                              <input
                                type="text"
                                placeholder="Praise, corrections, or suggestions..."
                                value={evalFeedback}
                                onChange={(e) => setEvalFeedback(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-1.5"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEvaluatingSub(null)}
                              className="px-3 py-1 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={evalSubmitting}
                              className="px-4 py-1 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700"
                            >
                              {evalSubmitting ? 'Saving...' : 'Save Grade'}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex justify-end">
                          <button
                            onClick={() => startEvaluate(sub)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                          >
                            <Award className="w-3.5 h-3.5" />
                            {isGraded ? 'Edit Grade & Feedback' : 'Grade Submission'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end border-t pt-3 shrink-0">
              <button
                onClick={() => setSelectedAssignment(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
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
