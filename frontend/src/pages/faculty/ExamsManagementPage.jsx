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
  Award,
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
      // Validate marks
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
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Examination Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Schedule tests, evaluate student marks, and publish official academic results.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Schedule Examination
        </button>
      </div>

      {error ? (
        <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200">{error}</div>
      ) : exams.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-800">No examinations created yet</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">
            Create an examination schedule for any of your assigned classes and subjects.
          </p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
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
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-semibold uppercase tracking-wider mb-1.5">
                      {exam.class_name} • {exam.subject_code} - {exam.subject_name}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900">{exam.name}</h3>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shrink-0 ${
                      exam.is_published
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {exam.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl text-xs">
                  <div>
                    <span className="text-gray-500 block">Date & Time:</span>
                    <span className="font-semibold text-gray-800">
                      {date.toLocaleDateString()} {exam.start_time && `(${exam.start_time})`}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Duration:</span>
                    <span className="font-semibold text-gray-800">{exam.duration_minutes} Mins</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Max Marks:</span>
                    <span className="font-semibold text-gray-800">{exam.max_marks} pts</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Passing Marks:</span>
                    <span className="font-semibold text-gray-800">{exam.passing_marks} pts</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    Marks recorded: <strong>{exam.marks_entered_count}</strong> of{' '}
                    <strong>{exam.total_students}</strong> students
                  </span>
                </div>

                {/* Actions Bar */}
                <div className="flex items-center justify-between gap-2 pt-2">
                  <button
                    onClick={() => openMarksModal(exam)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Enter / Edit Marks
                  </button>

                  <button
                    onClick={() => handleTogglePublish(exam)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">Schedule New Examination</h3>
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
                <label className="block font-semibold text-gray-700 mb-1">Exam Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Term Examination 2026"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Exam Type</label>
                  <select
                    value={formData.exam_type}
                    onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm"
                  >
                    <option value="UNIT_TEST">Unit Test</option>
                    <option value="MID_TERM">Mid Term</option>
                    <option value="FINAL">Final Examination</option>
                    <option value="QUIZ">Quiz / Assessment</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Exam Date</label>
                  <input
                    type="date"
                    required
                    value={formData.exam_date}
                    onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    placeholder="10:00 AM"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Duration (Min)</label>
                  <input
                    type="number"
                    min="10"
                    max="360"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Max Marks</label>
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
                <label className="block font-semibold text-gray-700 mb-1">Passing Marks</label>
                <input
                  type="number"
                  min="0"
                  value={formData.passing_marks}
                  onChange={(e) => setFormData({ ...formData, passing_marks: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Special Instructions (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Allowed stationery, calculator policy, syllabus topics..."
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm"
                ></textarea>
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
                  {createSubmitting ? 'Creating...' : 'Create Examination'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enter / Edit Marks Modal */}
      {selectedExamForMarks && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Enter Student Marks</h3>
                <p className="text-xs text-gray-500">
                  {selectedExamForMarks.name} ({selectedExamForMarks.class_name} • Max Marks:{' '}
                  {selectedExamForMarks.max_marks})
                </p>
              </div>
              <button
                onClick={() => setSelectedExamForMarks(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {marksError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 shrink-0">
                {marksError}
              </div>
            )}
            {marksSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg border border-emerald-200 shrink-0 flex items-center gap-1.5 font-bold">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Marks successfully saved and updated!
              </div>
            )}

            {loadingMarks ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : marksList.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-xs">
                No students enrolled in this class.
              </div>
            ) : (
              <div className="overflow-y-auto flex-1 pr-1">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 sticky top-0 border-b">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold text-gray-600">Roll No</th>
                      <th className="py-2.5 px-3 font-semibold text-gray-600">Student Name</th>
                      <th className="py-2.5 px-3 font-semibold text-gray-600 text-center w-28">
                        Marks (Max: {selectedExamForMarks.max_marks})
                      </th>
                      <th className="py-2.5 px-3 font-semibold text-gray-600">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {marksList.map((m) => (
                      <tr key={m.student_id} className="hover:bg-gray-50/70">
                        <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">
                          {m.student_roll_number}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-gray-900">{m.student_name}</td>
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
                            className="w-20 text-center font-bold text-sm border border-gray-300 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                            className="w-full text-xs border border-gray-200 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t shrink-0">
              <button
                type="button"
                onClick={() => setSelectedExamForMarks(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSaveMarks}
                disabled={savingMarks || loadingMarks || marksList.length === 0}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition disabled:opacity-50"
              >
                {savingMarks ? 'Saving...' : 'Save All Marks'}
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
