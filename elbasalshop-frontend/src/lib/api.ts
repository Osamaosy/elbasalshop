import axios from 'axios';

// 1️⃣ تعديل الرابط الأساسي هنا (بدون /api)
// هذا الرابط سيستخدم للصور أو أي روابط عامة
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://premier-nikoletta-elbasalphone-cda5b22b.koyeb.app';

// 2️⃣ رابط الـ API (بإضافة /api)
export const API_URL = `${API_BASE_URL}/api`;

const api = axios.create({
  // استخدام المتغير API_URL مباشرة لضمان التوافق
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // التأكد من عدم وجود loop في حالة الخطأ 401
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      // لا تقم بالطرد إذا كنا بالفعل في صفحة الدخول لتجنب التكرار
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ✅ Fixed Image URL Handler
export const getImageUrl = (path: string | null | undefined): string => {
  if (!path || path === '/placeholder.svg') {
    return 'https://placehold.co/600x600/1e40af/ffffff?text=No+Image';
  }
  
  // صور Cloudinary تأتي برابط كامل، لذا نرجعها كما هي
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // في حالة وجود صور قديمة مخزنة محلياً، نستخدم الرابط الأساسي الصحيح
  return `${API_BASE_URL}${path}`;
};

// Format price in EGP
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export default api;