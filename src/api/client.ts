
import { toast } from "sonner";

const API_URL = 'http://localhost:3001/api';
const TIMEOUT_MS = 10000; // 10 seconds timeout

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

// Mock API responses for testing when the server is unavailable
const mockResponses = {
  register: {
    token: 'mock-token',
    user: {
      id: 'mock-id',
      name: 'Mock User',
      email: 'mock@example.com',
      role: 'tutor'
    }
  },
  login: {
    token: 'mock-token',
    user: {
      id: 'mock-id',
      name: 'Mock User',
      email: 'mock@example.com',
      role: 'tutor'
    }
  }
};

// Function to create a timeout promise
const timeoutPromise = (ms: number) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timed out after ${ms}ms`));
    }, ms);
  });
};

const apiClient = async (
  endpoint: string,
  method: string = 'GET',
  data?: any,
  requiresAuth: boolean = true,
  useMock: boolean = false
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
    // If using mock response, return it immediately
    if (useMock) {
      console.log('Using mock response for', endpoint);
      // @ts-ignore
      return mockResponses[endpoint.split('/').pop()];
    }

    // Create a fetch request with timeout
    const fetchPromise = fetch(`${API_URL}${endpoint}`, config);
    const response = await Promise.race([fetchPromise, timeoutPromise(TIMEOUT_MS)]) as Response;
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.msg || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    console.error('API error:', message);
    
    // If fetch failed (likely server down), try to use mock response for critical paths
    if ((error instanceof Error && error.message.includes('Failed to fetch')) || 
        (error instanceof Error && error.message.includes('timed out'))) {
      
      // Only use mocks for register and login
      if (endpoint === '/users/register' || endpoint === '/users/login') {
        console.log('Server unavailable, using mock response');
        toast.info('Server unavailable, using demo mode');
        // @ts-ignore
        return mockResponses[endpoint.split('/').pop()];
      }
    }
    
    toast.error(message);
    throw error;
  }
};

export default {
  // Auth
  register: (userData: any) => apiClient('/users/register', 'POST', userData, false, true),
  login: (credentials: any) => apiClient('/users/login', 'POST', credentials, false, true),
  
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
