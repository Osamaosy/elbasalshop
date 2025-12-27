// src/types/index.ts

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  address?: string;
  city?: string;
}

// ✅ الشكل العام الموحد للردود من الباك اند
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ✅ محتوى رد التوثيق (الدخول/التسجيل)
export interface AuthPayload {
  user: User;
  token: string;
}

// تعريف نوع رد التوثيق باستخدام الشكل العام
export type AuthResponse = ApiResponse<AuthPayload>;

export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  oldPrice?: number;
  images: string[];
  category: Category | string;
  brand?: string;
  stock: number;
  specifications?: Record<string, string>;
  featured?: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  _id: string;
  user?: User;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: {
    product: Product;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  createdAt: string;
}

// ✅ محتوى رد الطلب (عشان الواتساب)
export interface OrderPayload {
  order: Order;
  whatsappLink: string;
}

// تعريف نوع رد الطلب
export type OrderResponse = ApiResponse<OrderPayload>;