
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

export const getAuthToken = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
};

export const isAuthenticated = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

export const getUserRole = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
    
  return profile?.role || null;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  return profile ? { ...profile } : null;
};

const handleError = (error: any) => {
  const message = error?.message || 'An error occurred';
  console.error('API error:', message);
  toast.error(message);
  throw error;
};

const apiClient = {
  // Students
  getStudents: async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*');
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      return handleError(error);
    }
  },
  
  addStudent: async (studentData: any) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .insert(studentData)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Homework
  getHomework: async () => {
    try {
      const { data, error } = await supabase
        .from('homework')
        .select('*');
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      return handleError(error);
    }
  },
  
  addHomework: async (homeworkData: any) => {
    try {
      const { data, error } = await supabase
        .from('homework')
        .insert(homeworkData)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      return handleError(error);
    }
  },
  
  updateHomeworkStatus: async (id: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from('homework')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Exams
  getExams: async () => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .select('*');
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      return handleError(error);
    }
  },
  
  addExam: async (examData: any) => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .insert(examData)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      return handleError(error);
    }
  },
  
  updateExamScore: async (id: string, score: number) => {
    try {
      const { data, error } = await supabase
        .from('exams')
        .update({ score })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Attendance
  getAttendance: async () => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*');
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      return handleError(error);
    }
  },
  
  markAttendance: async (attendanceData: any) => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .insert(attendanceData)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Fees
  getFees: async () => {
    try {
      const { data, error } = await supabase
        .from('fees')
        .select('*');
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      return handleError(error);
    }
  },
  
  addFee: async (feeData: any) => {
    try {
      const { data, error } = await supabase
        .from('fees')
        .insert(feeData)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      return handleError(error);
    }
  },
  
  updateFeeStatus: async (id: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from('fees')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      return handleError(error);
    }
  },
  
  // Performance
  getPerformance: async () => {
    try {
      const { data, error } = await supabase
        .from('performance')
        .select('*');
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      return handleError(error);
    }
  },
  
  addPerformance: async (performanceData: any) => {
    try {
      const { data, error } = await supabase
        .from('performance')
        .insert(performanceData)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      return handleError(error);
    }
  }
};

export default apiClient;
