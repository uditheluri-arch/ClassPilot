import api from './api';

export const authService = {
  login: async ({ role, identifier, password }) => {
    const response = await api.post('/auth/login', {
      role,
      identifier,
      password,
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('classpilot_token');
      localStorage.removeItem('classpilot_user');
    }
  },

  getStudentProfile: async () => {
    const response = await api.get('/student/profile');
    return response.data;
  },

  getFacultyProfile: async () => {
    const response = await api.get('/faculty/profile');
    return response.data;
  },
};

export default authService;
