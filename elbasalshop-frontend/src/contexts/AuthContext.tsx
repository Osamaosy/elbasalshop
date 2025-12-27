import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';
import { User, AuthResponse } from '@/types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ تحميل البيانات من localStorage عند التشغيل
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        const parsedUser = JSON.parse(storedUser);
        
        // ✅ التحقق من صلاحية التوكن
        try {
          await api.get('/auth/profile');
          setUser(parsedUser);
        } catch (error: any) {
          // لو التوكن expired أو invalid
          if (error.response?.status === 401) {
            console.log('Token expired, logging out...');
            handleAuthError();
          } else {
            // لو مشكلة في الاتصال، نستخدم البيانات المخزنة
            setUser(parsedUser);
          }
        }
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
      handleAuthError();
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ دالة لتنظيف البيانات عند حدوث خطأ
  const handleAuthError = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // ✅ دالة لتحديث بيانات المستخدم
  const refreshAuth = async () => {
    try {
      const response = await api.get('/auth/profile');
      const userData = response.data.data?.user || response.data.user;
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to refresh auth:', error);
      handleAuthError();
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      
      const { token, user } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      toast.success(`مرحباً ${user.name}! 👋`);
      return true;
    } catch (error: any) {
      console.error('Login Error:', error);
      
      // ✅ رسائل خطأ أوضح
      if (error.response?.status === 401) {
        toast.error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } else if (error.response?.status === 403) {
        toast.error('حسابك معطل، تواصل مع الإدارة');
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('خطأ في الاتصال بالسيرفر');
      } else {
        toast.error(error.response?.data?.message || 'فشل تسجيل الدخول');
      }
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string): Promise<boolean> => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', { 
        name, 
        email, 
        password, 
        phone 
      });
      
      const { token, user } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      toast.success(`أهلاً بك ${user.name}! 🎉`);
      return true;
    } catch (error: any) {
      console.error('Register Error:', error);
      
      // ✅ رسائل خطأ أوضح
      if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.message;
        if (errorMsg?.includes('email')) {
          toast.error('البريد الإلكتروني مستخدم بالفعل');
        } else if (errorMsg?.includes('phone')) {
          toast.error('رقم الهاتف مستخدم بالفعل');
        } else {
          toast.error('البيانات المدخلة غير صحيحة');
        }
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('خطأ في الاتصال بالسيرفر');
      } else {
        toast.error(error.response?.data?.message || 'فشل إنشاء الحساب');
      }
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('تم تسجيل الخروج بنجاح 👋');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};