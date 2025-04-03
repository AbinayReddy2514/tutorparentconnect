
import { toast } from "sonner";

const API_URL = 'http://localhost:3001/api';

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const setAuthToken = (token: string) => {
  localStorage.setItem('authToken', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

export const getUserRole = () => {
  const userString = localStorage.getItem('user');
  if (!userString) return null;
  try {
    const user = JSON.parse(userString);
    return user.role;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export const getCurrentUser = () => {
  const userString = localStorage.getItem('user');
  if (!userString) return null;
  try {
    return JSON.parse(userString);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

const apiClient = async (
  endpoint: string,
  method: string = 'GET',
  data?: any,
  requiresAuth: boolean = true
) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (requiresAuth) {
    const token = getAuthToken();
    if (token) {
      headers['x-auth-token'] = token;
    }
  }

  const config: RequestInit = {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.msg || 'Something went wrong');
    }

    return await response.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    toast.error(message);
    throw error;
  }
};

export default {
  // Auth
  register: (userData: any) => apiClient('/users/register', 'POST', userData, false),
  login: (credentials: any) => apiClient('/users/login', 'POST', credentials, false),
  
  // Students
  getStudents: () => apiClient('/students'),
  addStudent: (studentData: any) => apiClient('/students', 'POST', studentData),
  
  // Homework
  getHomework: () => apiClient('/homework'),
  addHomework: (homeworkData: any) => apiClient('/homework', 'POST', homeworkData),
  updateHomeworkStatus: (id: string, status: string) => 
    apiClient(`/homework/${id}`, 'PATCH', { status }),
  
  // Exams
  getExams: () => apiClient('/exams'),
  addExam: (examData: any) => apiClient('/exams', 'POST', examData),
  updateExamScore: (id: string, score: number) => 
    apiClient(`/exams/${id}`, 'PATCH', { score }),
  
  // Attendance
  getAttendance: () => apiClient('/attendance'),
  markAttendance: (attendanceData: any) => apiClient('/attendance', 'POST', attendanceData),
  
  // Fees
  getFees: () => apiClient('/fees'),
  addFee: (feeData: any) => apiClient('/fees', 'POST', feeData),
  updateFeeStatus: (id: string, status: string) => 
    apiClient(`/fees/${id}`, 'PATCH', { status }),
  
  // Performance
  getPerformance: () => apiClient('/performance'),
  addPerformance: (performanceData: any) => apiClient('/performance', 'POST', performanceData),
};
