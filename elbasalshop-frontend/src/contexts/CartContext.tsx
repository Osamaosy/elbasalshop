import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '@/types';
import toast from 'react-hot-toast';
import api from '@/lib/api'; // تأكدنا من وجود ملف api

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  refreshCart: () => Promise<void>; // دالة جديدة لتحديث البيانات يدوياً إذا لزم الأمر
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = 'elbasal_cart';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // تحميل السلة عند البدء
  useEffect(() => {
    const initializeCart = async () => {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        try {
          const parsedItems: CartItem[] = JSON.parse(storedCart);
          // بمجرد تحميل البيانات المحلية، نقوم بالتحقق منها مع السيرفر فوراً
          await validateAndSyncCart(parsedItems);
        } catch {
          localStorage.removeItem(CART_STORAGE_KEY);
          setItems([]);
        }
      }
    };
    initializeCart();
  }, []);

  // دالة لمزامنة السلة مع السيرفر (تحديث الأسعار والمخزون)
// استبدل دالة validateAndSyncCart الحالية بهذا الكود:

  const validateAndSyncCart = async (localItems: CartItem[]) => {
    if (localItems.length === 0) {
        setItems([]);
        return;
    }

    try {
      // 1. تجميع كل الـ IDs في نص واحد
      const productIds = localItems.map(item => item.product._id).join(',');

      // 2. إرسال طلب واحد فقط للسيرفر (Performance Fix) 🚀
      const { data } = await api.get(`/products?ids=${productIds}`);
      const freshProducts: Product[] = data.data.products || [];

      // 3. مطابقة البيانات
      const validatedItems: CartItem[] = [];
      
      localItems.forEach(localItem => {
        const freshProduct = freshProducts.find(p => p._id === localItem.product._id);
        
        if (freshProduct && freshProduct.isAvailable && freshProduct.stock > 0) {
            const adjustedQuantity = localItem.quantity > freshProduct.stock 
                ? freshProduct.stock 
                : localItem.quantity;

            validatedItems.push({
                product: freshProduct,
                quantity: adjustedQuantity
            });
        }
      });

      setItems(validatedItems);
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(validatedItems));

    } catch (error) {
      console.error('Failed to sync cart:', error);
      setItems(localItems);
    }
  };

  // حفظ السلة في localStorage عند أي تغيير
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const addToCart = (product: Product, quantity = 1) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.product._id === product._id);
      
      // نستخدم المخزون الحالي الموجود في كائن المنتج الممرر (يجب أن يكون حديثاً من الصفحة)
      // أو نستخدم المخزون الموجود في السلة إذا تم تحديثها
      const currentStock = product.stock;

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        
        // التحقق من المخزون
        if (newQuantity > currentStock) {
          toast.error(`عذراً، المتوفر فقط ${currentStock} قطع`);
          return prevItems;
        }

        toast.success('تم تحديث الكمية في السلة');
        return prevItems.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: newQuantity, product: product } // تحديث بيانات المنتج أيضاً لضمان حداثة السعر
            : item
        );
      }
      
      if (quantity > currentStock) {
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
      // التحقق من المخزون بناءً على البيانات الموجودة حالياً في السلة (التي تم تحديثها عند التحميل)
      if (item && quantity > item.product.stock) {
        toast.error(`عذراً، أقصى كمية متوفرة هي ${item.product.stock}`);
        return prevItems;
      }
      
      return prevItems.map((item) =>
        item.product._id === productId ? { ...item, quantity } : item
      );
    });
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  const refreshCart = async () => {
    await validateAndSyncCart(items);
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
        refreshCart,
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