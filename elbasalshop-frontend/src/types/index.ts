export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  createdAt: string;
}

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

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface OrderResponse {
  success: boolean;
  order: Order;
  whatsappLink: string;
}
