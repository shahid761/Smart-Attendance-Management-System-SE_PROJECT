import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchStudents = async (search = '') => {
  const params = search ? { search } : {};
  const response = await api.get('/students', { params });
  return response.data;
};

export const createStudent = async (studentData) => {
  const response = await api.post('/students', studentData);
  return response.data;
};

export const getStudent = async (id) => {
  const response = await api.get(`/students/${id}`);
  return response.data;
};

export const updateStudent = async (id, studentData) => {
  const response = await api.put(`/students/${id}`, studentData);
  return response.data;
};

export const deleteStudent = async (id) => {
  const response = await api.delete(`/students/${id}`);
  return response.data;
};

export const fetchAttendance = async (date = '', studentId = '') => {
  const params = {};
  if (date) params.date = date;
  if (studentId) params.student_id = studentId;
  const response = await api.get('/attendance', { params });
  return response.data;
};

export const markAttendance = async (studentId, confidence = 1.0) => {
  const response = await api.post('/attendance', {
    student_id: studentId,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0],
    status: 'Present',
    confidence,
  });
  return response.data;
};

export const registerFace = async (studentId, imageData) => {
  const response = await api.post('/recognition/register', {
    student_id: studentId,
    image_data: imageData,
  });
  return response.data;
};

export const recognizeFace = async (imageData) => {
  const response = await api.post('/recognition/recognize', {
    image_data: imageData,
  });
  return response.data;
};

export const fetchTrackingLogs = async () => {
  const response = await api.get('/tracking');
  return response.data;
};

export const fetchDashboardStats = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};

export default api;
