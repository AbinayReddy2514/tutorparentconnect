
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient, { 
  setAuthToken, 
  removeAuthToken, 
  getAuthToken, 
  getCurrentUser 
} from '../api/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: any;
  loading: boolean;
  isAuthenticated: boolean;
  register: (userData: any) => Promise<void>;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const token = getAuthToken();
    const savedUser = getCurrentUser();
    
    if (token && savedUser) {
      setUser(savedUser);
      setIsAuthenticated(true);
    }
    
    setLoading(false);
  }, []);

  const register = async (userData: any) => {
    try {
      setLoading(true);
      const response = await apiClient.register(userData);
      
      // Set token and user in localStorage
      setAuthToken(response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Update state
      setUser(response.user);
      setIsAuthenticated(true);
      
      toast.success('Registration successful');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: any) => {
    try {
      setLoading(true);
      const response = await apiClient.login(credentials);
      
      // Set token and user in localStorage
      setAuthToken(response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Update state
      setUser(response.user);
      setIsAuthenticated(true);
      
      toast.success('Login successful');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Remove token and user from localStorage
    removeAuthToken();
    localStorage.removeItem('user');
    
    // Update state
    setUser(null);
    setIsAuthenticated(false);
    
    toast.info('Logged out');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        register,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
