// src/types/index.ts - ✅ مطابق 100% مع Backend

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  type: 'mobile' | 'accessory' | 'other';
  description?: string;
  image?: string;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  category: Category | string;
  brand: string;
  description: string;
  specifications: Record<string, string>;
  price: number;
  discountPrice?: number; // ✅ Backend name
  stock: number;
  images: string[];
  mainImage: string;
  isAvailable: boolean;
  isFeatured: boolean; // ✅ Backend name
  tags?: string[];
  views?: number;
  rating?: {
    average: number;
    count: number;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface OrderProduct {
  product: string | Product;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string | User;
  products: OrderProduct[]; // ✅ Backend name
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    city?: string;
    notes?: string;
  };
  whatsappSent?: boolean;
  statusHistory?: Array<{
    status: string;
    timestamp: Date;
  }>;
  notes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface AuthPayload {
  user: User;
  token: string;
}

export type AuthResponse = ApiResponse<AuthPayload>;

export interface OrderPayload {
  order: Order;
  whatsappLink: string;
}

export type OrderResponse = ApiResponse<OrderPayload>;

export interface ProductsResponse {
  products: Product[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface OrdersResponse {
  orders: Order[];
  stats?: {
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}