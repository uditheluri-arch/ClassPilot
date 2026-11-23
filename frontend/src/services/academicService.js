import api from './api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// --- Module 1: Academic Structure & Student Management ---

export const getFacultyClasses = async () => {
  const response = await api.get('/academic/classes');
  return response.data;
};

export const getClassStudents = async (classId) => {
  const response = await api.get(`/academic/classes/${classId}/students`);
  return response.data;
};

export const searchStudents = async (query) => {
  const response = await api.get(`/academic/students/search`, {
    params: { q: query },
  });
  return response.data;
};

export const getTeachingAssignments = async () => {
  const response = await api.get('/academic/teaching-assignments');
  return response.data;
};

export const getMyClass = async () => {
  const response = await api.get('/academic/my-class');
  return response.data;
};

export const getMyClassmates = async () => {
  const response = await api.get('/academic/my-classmates');
  return response.data;
};

// --- Module 2: Examination Management ---

export const createExam = async (examData) => {
  const response = await api.post('/exams/', examData);
  return response.data;
};

export const getFacultyExams = async () => {
  const response = await api.get('/exams/faculty');
  return response.data;
};

export const getStudentExams = async () => {
  const response = await api.get('/exams/student');
  return response.data;
};

export const getExamMarks = async (examId) => {
  const response = await api.get(`/exams/${examId}/marks`);
  return response.data;
};

export const submitExamMarks = async (examId, marks) => {
  const response = await api.post(`/exams/${examId}/marks`, { marks });
  return response.data;
};

export const togglePublishExam = async (examId, isPublished) => {
  const response = await api.patch(`/exams/${examId}/publish`, {
    is_published: isPublished,
  });
  return response.data;
};

export const getMyResults = async () => {
  const response = await api.get('/exams/my-results');
  return response.data;
};

// --- Module 3: Assignments & Study Materials ---

export const createAssignment = async (formData) => {
  const response = await api.post('/assignments/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getFacultyAssignments = async () => {
  const response = await api.get('/assignments/faculty');
  return response.data;
};

export const getStudentAssignments = async () => {
  const response = await api.get('/assignments/student');
  return response.data;
};

export const submitAssignment = async (assignmentId, formData) => {
  const response = await api.post(`/assignments/${assignmentId}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getAssignmentSubmissions = async (assignmentId) => {
  const response = await api.get(`/assignments/${assignmentId}/submissions`);
  return response.data;
};

export const evaluateSubmission = async (submissionId, evaluationData) => {
  const response = await api.post(`/assignments/submissions/${submissionId}/evaluate`, evaluationData);
  return response.data;
};

export const uploadStudyMaterial = async (formData) => {
  const response = await api.post('/assignments/materials', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getFacultyStudyMaterials = async () => {
  const response = await api.get('/assignments/materials/faculty');
  return response.data;
};

export const getStudentStudyMaterials = async () => {
  const response = await api.get('/assignments/materials/student');
  return response.data;
};

export const getDownloadUrl = (subfolder, filename) => {
  return `${API_BASE_URL}/assignments/files/${subfolder}/${encodeURIComponent(filename)}`;
};
