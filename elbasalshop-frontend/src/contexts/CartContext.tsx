import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '@/types';
import toast from 'react-hot-toast';

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'elbasal_cart';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      try {
        setItems(JSON.parse(storedCart));
      } catch {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const addToCart = (product: Product, quantity = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product._id === product._id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
          toast.error('الكمية المطلوبة غير متوفرة في المخزون');
          return prevItems;
        }
        toast.success('تم تحديث الكمية في السلة');
        return prevItems.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
      
      if (quantity > product.stock) {
        toast.error('الكمية المطلوبة غير متوفرة في المخزون');
        return prevItems;
      }
      
      toast.success('تمت الإضافة إلى السلة');
      return [...prevItems, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.product._id !== productId));
    toast.success('تم الحذف من السلة');
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setItems((prevItems) => {
      const item = prevItems.find((i) => i.product._id === productId);
      if (item && quantity > item.product.stock) {
        toast.error('الكمية المطلوبة غير متوفرة في المخزون');
        return prevItems;
      }
      
      return prevItems.map((item) =>
        item.product._id === productId ? { ...item, quantity } : item
      );
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
