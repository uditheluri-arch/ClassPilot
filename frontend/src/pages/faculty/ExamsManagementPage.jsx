import React, { useState, useEffect } from 'react';
import {
  getFacultyExams,
  createExam,
  getExamMarks,
  submitExamMarks,
  togglePublishExam,
  getTeachingAssignments,
} from '../../services/academicService';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  Calendar,
  Clock,
  Plus,
  CheckCircle,
  Eye,
  EyeOff,
  Edit3,
  X,
  AlertCircle,
  Users,
} from 'lucide-react';

const ExamsManagementPage = () => {
  const [exams, setExams] = useState([]);
  const [teachingAssignments, setTeachingAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    class_subject_id: '',
    name: '',
    exam_type: 'UNIT_TEST',
    exam_date: '',
    start_time: '10:00 AM',
    duration_minutes: 90,
    max_marks: 100,
    passing_marks: 40,
    instructions: '',
  });
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Marks Modal State
  const [selectedExamForMarks, setSelectedExamForMarks] = useState(null);
  const [marksList, setMarksList] = useState([]);
  const [loadingMarks, setLoadingMarks] = useState(false);
  const [savingMarks, setSavingMarks] = useState(false);
  const [marksError, setMarksError] = useState(null);
  const [marksSuccess, setMarksSuccess] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [examsData, assignmentsData] = await Promise.all([
        getFacultyExams(),
        getTeachingAssignments(),
      ]);
      setExams(examsData);
      setTeachingAssignments(assignmentsData);
      if (assignmentsData.length > 0 && !formData.class_subject_id) {
        setFormData((prev) => ({
          ...prev,
          class_subject_id: assignmentsData[0].class_subject_id,
        }));
      }
    } catch (err) {
      console.error('Failed to load examinations:', err);
      setError(err.response?.data?.detail || 'Failed to load examinations.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setCreateSubmitting(true);
      setCreateError(null);
      if (Number(formData.passing_marks) > Number(formData.max_marks)) {
        setCreateError('Passing marks cannot exceed maximum marks.');
        return;
      }

      await createExam({
        ...formData,
        class_subject_id: Number(formData.class_subject_id),
        max_marks: Number(formData.max_marks),
        passing_marks: Number(formData.passing_marks),
        duration_minutes: Number(formData.duration_minutes),
        exam_date: new Date(formData.exam_date).toISOString(),
      });

      setIsCreateOpen(false);
      setFormData({
        class_subject_id: teachingAssignments[0]?.class_subject_id || '',
        name: '',
        exam_type: 'UNIT_TEST',
        exam_date: '',
        start_time: '10:00 AM',
        duration_minutes: 90,
        max_marks: 100,
        passing_marks: 40,
        instructions: '',
      });
      fetchInitialData();
    } catch (err) {
      console.error('Create exam failed:', err);
      setCreateError(err.response?.data?.detail || 'Failed to create examination.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleTogglePublish = async (exam) => {
    try {
      const updated = await togglePublishExam(exam.id, !exam.is_published);
      setExams((prev) => prev.map((e) => (e.id === exam.id ? updated : e)));
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to toggle publication status.');
    }
  };

  const openMarksModal = async (exam) => {
    setSelectedExamForMarks(exam);
    setMarksError(null);
    setMarksSuccess(false);
    try {
      setLoadingMarks(true);
      const marksData = await getExamMarks(exam.id);
      setMarksList(marksData);
    } catch (err) {
      console.error('Failed to load marks:', err);
      setMarksError(err.response?.data?.detail || 'Failed to load student roster for marks.');
    } finally {
      setLoadingMarks(false);
    }
  };

  const handleMarkChange = (studentId, field, value) => {
    setMarksList((prev) =>
      prev.map((item) =>
        item.student_id === studentId ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSaveMarks = async () => {
    try {
      setSavingMarks(true);
      setMarksError(null);
      for (const m of marksList) {
        const val = Number(m.marks_obtained);
        if (val < 0 || val > selectedExamForMarks.max_marks) {
          setMarksError(`Marks for ${m.student_name} must be between 0 and ${selectedExamForMarks.max_marks}`);
          return;
        }
      }

      const payload = marksList.map((m) => ({
        student_id: m.student_id,
        marks_obtained: Number(m.marks_obtained),
        remarks: m.remarks || '',
      }));

      const updated = await submitExamMarks(selectedExamForMarks.id, payload);
      setMarksList(updated);
      setMarksSuccess(true);
      fetchInitialData();
      setTimeout(() => setMarksSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to save marks:', err);
      setMarksError(err.response?.data?.detail || 'Failed to save marks.');
    } finally {
      setSavingMarks(false);
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
              <h1 className="text-2xl font-bold text-[#172033]">Examination Management</h1>
              <p className="text-sm text-[#64748B] mt-1">
                Schedule examinations, record evaluation marks, and publish official grades.
              </p>
            </div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#315E91] text-white font-medium text-sm rounded-md hover:bg-[#264D78] transition shadow-xs self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              Schedule Exam
            </button>
          </div>

          {error ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">{error}</div>
          ) : exams.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] rounded-md p-10 text-center">
              <Calendar className="w-10 h-10 text-[#64748B] mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-[#172033]">No examinations scheduled</h3>
              <p className="text-xs text-[#64748B] mt-1 mb-4">
                Create an examination schedule for any of your assigned classes and subjects.
              </p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-4 py-2 bg-[#315E91] text-white text-xs font-medium rounded-md hover:bg-[#264D78] transition"
              >
                Schedule First Exam
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {exams.map((exam) => {
                const date = new Date(exam.exam_date);
                return (
                  <div
                    key={exam.id}
                    className="bg-white rounded-md border border-[#E2E8F0] p-5 shadow-xs hover:border-[#315E91]/40 transition space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="inline-block px-2 py-0.5 bg-[#F0F5FA] text-[#315E91] border border-[#C3D9EB] rounded text-xs font-semibold mb-1.5">
                          {exam.class_name} • {exam.subject_code} - {exam.subject_name}
                        </span>
                        <h3 className="text-base font-bold text-[#172033]">{exam.name}</h3>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold shrink-0 ${
                          exam.is_published
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {exam.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 bg-[#F7F8FA] p-3 rounded border border-[#E2E8F0] text-xs">
                      <div>
                        <span className="text-[#64748B] block">Date & Time</span>
                        <span className="font-semibold text-[#172033]">
                          {date.toLocaleDateString()} {exam.start_time && `(${exam.start_time})`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#64748B] block">Duration</span>
                        <span className="font-semibold text-[#172033]">{exam.duration_minutes} Mins</span>
                      </div>
                      <div>
                        <span className="text-[#64748B] block">Max Marks</span>
                        <span className="font-semibold text-[#172033]">{exam.max_marks} pts</span>
                      </div>
                      <div>
                        <span className="text-[#64748B] block">Passing Marks</span>
                        <span className="font-semibold text-[#172033]">{exam.passing_marks} pts</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#64748B] pt-2 border-t border-[#E2E8F0]">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#64748B]" />
                        Marks recorded: <strong className="text-[#172033]">{exam.marks_entered_count}</strong> of{' '}
                        <strong className="text-[#172033]">{exam.total_students}</strong> students
                      </span>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex items-center justify-between gap-2 pt-2">
                      <button
                        onClick={() => openMarksModal(exam)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#315E91] text-white rounded-md text-xs font-medium hover:bg-[#264D78] transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Enter / Edit Marks
                      </button>

                      <button
                        onClick={() => handleTogglePublish(exam)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition border ${
                          exam.is_published
                            ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {exam.is_published ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            Unpublish Results
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            Publish Results
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Create Exam Modal */}
          {isCreateOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
              <div className="bg-white rounded-md border border-[#E2E8F0] max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
                  <h3 className="text-base font-bold text-[#172033]">Schedule New Examination</h3>
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
                    <label className="block font-semibold text-[#172033] mb-1">Exam Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mid-Term Examination 2026"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border border-[#E2E8F0] rounded-md p-2.5 text-sm bg-[#F7F8FA] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#315E91] focus:border-[#315E91]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#172033] mb-1">Exam Type</label>
                      <select
                        value={formData.exam_type}
                        onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
                        className="w-full border border-[#E2E8F0] rounded-md p-2.5 text-sm bg-[#F7F8FA] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#315E91] focus:border-[#315E91]"
                      >
                        <option value="UNIT_TEST">Unit Test</option>
                        <option value="MID_TERM">Mid Term</option>
                        <option value="FINAL">Final Examination</option>
                        <option value="QUIZ">Quiz / Assessment</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-[#172033] mb-1">Exam Date</label>
                      <input
                        type="date"
                        required
                        value={formData.exam_date}
                        onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                        className="w-full border border-[#E2E8F0] rounded-md p-2.5 text-sm bg-[#F7F8FA] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#315E91] focus:border-[#315E91]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-[#172033] mb-1">Start Time</label>
                      <input
                        type="text"
                        placeholder="10:00 AM"
                        value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                        className="w-full border border-[#E2E8F0] rounded-md p-2.5 text-sm bg-[#F7F8FA] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#315E91] focus:border-[#315E91]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#172033] mb-1">Duration (Min)</label>
                      <input
                        type="number"
                        min="10"
                        max="360"
                        value={formData.duration_minutes}
                        onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                        className="w-full border border-[#E2E8F0] rounded-md p-2.5 text-sm bg-[#F7F8FA] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#315E91] focus:border-[#315E91]"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#172033] mb-1">Max Marks</label>
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
                    <label className="block font-semibold text-[#172033] mb-1">Passing Marks</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.passing_marks}
                      onChange={(e) => setFormData({ ...formData, passing_marks: e.target.value })}
                      className="w-full border border-[#E2E8F0] rounded-md p-2.5 text-sm bg-[#F7F8FA] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#315E91] focus:border-[#315E91]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#172033] mb-1">Instructions (Optional)</label>
                    <textarea
                      rows={2}
                      placeholder="Permitted stationery, calculator policy, syllabus topics..."
                      value={formData.instructions}
                      onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                      className="w-full border border-[#E2E8F0] rounded-md p-2.5 text-sm bg-[#F7F8FA] text-[#172033] focus:outline-none focus:ring-1 focus:ring-[#315E91] focus:border-[#315E91]"
                    ></textarea>
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
                      {createSubmitting ? 'Scheduling...' : 'Schedule Exam'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Enter / Edit Marks Modal */}
          {selectedExamForMarks && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
              <div className="bg-white rounded-md border border-[#E2E8F0] max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 shrink-0">
                  <div>
                    <h3 className="text-base font-bold text-[#172033]">Enter Examination Marks</h3>
                    <p className="text-xs text-[#64748B]">
                      {selectedExamForMarks.name} ({selectedExamForMarks.class_name} • Max Marks:{' '}
                      {selectedExamForMarks.max_marks})
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedExamForMarks(null)}
                    className="text-[#64748B] hover:text-[#172033] p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {marksError && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs rounded-md border border-red-200 shrink-0">
                    {marksError}
                  </div>
                )}
                {marksSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-md border border-emerald-200 shrink-0 flex items-center gap-1.5 font-medium">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Marks saved successfully.
                  </div>
                )}

                {loadingMarks ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#315E91]"></div>
                  </div>
                ) : marksList.length === 0 ? (
                  <div className="text-center py-8 text-[#64748B] text-xs">
                    No students enrolled in this class.
                  </div>
                ) : (
                  <div className="overflow-y-auto flex-1 pr-1 border border-[#E2E8F0] rounded-md">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F7F8FA] sticky top-0 border-b border-[#E2E8F0]">
                        <tr>
                          <th className="py-2.5 px-3 font-semibold text-[#64748B]">Roll No</th>
                          <th className="py-2.5 px-3 font-semibold text-[#64748B]">Student Name</th>
                          <th className="py-2.5 px-3 font-semibold text-[#64748B] text-center w-28">
                            Marks ({selectedExamForMarks.max_marks})
                          </th>
                          <th className="py-2.5 px-3 font-semibold text-[#64748B]">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {marksList.map((m) => (
                          <tr key={m.student_id} className="hover:bg-[#F7F8FA]">
                            <td className="py-2.5 px-3 font-mono font-bold text-[#315E91]">
                              {m.student_roll_number}
                            </td>
                            <td className="py-2.5 px-3 font-medium text-[#172033]">{m.student_name}</td>
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                max={selectedExamForMarks.max_marks}
                                value={m.marks_obtained}
                                onChange={(e) =>
                                  handleMarkChange(m.student_id, 'marks_obtained', e.target.value)
                                }
                                className="w-20 text-center font-bold text-xs border border-[#E2E8F0] rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-[#315E91]"
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <input
                                type="text"
                                placeholder="Optional remark..."
                                value={m.remarks || ''}
                                onChange={(e) =>
                                  handleMarkChange(m.student_id, 'remarks', e.target.value)
                                }
                                className="w-full text-xs border border-[#E2E8F0] rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-[#315E91]"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0] shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedExamForMarks(null)}
                    className="px-4 py-2 text-xs font-medium text-[#64748B] hover:text-[#172033] rounded-md"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveMarks}
                    disabled={savingMarks || loadingMarks || marksList.length === 0}
                    className="px-4 py-2 text-xs font-medium text-white bg-[#315E91] hover:bg-[#264D78] rounded-md transition disabled:opacity-50"
                  >
                    {savingMarks ? 'Saving...' : 'Save Marks'}
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

export default ExamsManagementPage;
