import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export interface LoginResponse {
  accessToken: string;
  user: Profile;
}

export interface Profile {
  id: string;
  studentId: string;
  fullName: string;
  faculty?: string;
  batch?: string;
  role: string;
  email?: string;
}

export const authApi = {
  login: (studentId: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { studentId, password }),
  me: () => api.get<Profile>('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const coursesApi = {
  list: (params?: { semester?: number; academicYear?: number }) =>
    api.get('/courses', { params }),
  stats: (params?: { semester?: number; academicYear?: number }) =>
    api.get('/courses/stats', { params }),
  uploadAdmin: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<{ courses: number; classes: number }>('/courses/admin/upload', form);
  },
  clearAdmin: (params?: { semester?: number; academicYear?: number }) =>
    api.delete<{ deletedCourses: number; deletedClasses: number }>('/courses/admin/clear', { params }),
};

export const registrationsApi = {
  availableClasses: (params?: { semester?: string; academicYear?: string }) =>
    api.get('/registrations/available-classes', { params }),
  enroll: (classIds: string[]) =>
    api.post<{ enrolled: string[]; failed: { classCode: string; reason: string }[] }>('/registrations/enroll', { classIds }),
  myClasses: () => api.get('/registrations/my-classes'),
  cancel: (enrollmentId: string) =>
    api.post<{ success: boolean; message: string }>(`/registrations/cancel/${enrollmentId}`),
};
