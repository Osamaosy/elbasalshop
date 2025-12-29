import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Package, Plus, ShoppingBag, Tag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Order, Product, Category } from '@/types';
import { toast } from 'sonner';

import AdminStats from '@/components/admin/AdminStats';
import OrdersList from '@/components/admin/OrdersList';
import ProductsList from '@/components/admin/ProductsList';
import ProductForm from '@/components/admin/ProductForm';
import CategoriesList from '@/components/admin/CategoriesList';
import CategoryForm from '@/components/admin/CategoryForm';
// 1. تعريف شكل الخطأ المتوقع من الـ API (Axios)
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// 2. دالة مساعدة لاستخراج رسالة الخطأ بأمان
const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  // نقوم بإخبار TS أن هذا الخطأ هو من نوع ApiError
  const apiError = error as ApiError;
  return apiError.response?.data?.message || defaultMessage;
};

const Admin: React.FC = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'categories' | 'add-product' | 'add-category'>(
    'orders'
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await Promise.allSettled([
        api.get('/orders/admin/all'),
        api.get('/products'),
        api.get('/categories'),
      ]);

      if (results[0].status === 'fulfilled') {
        // يمكنك هنا أيضاً تعريف واجهة لاستجابة الـ API لزيادة الأمان
        const ordersData = results[0].value.data;
        setOrders(ordersData.data?.orders || ordersData.orders || []);
      } else {
        console.error('Failed to fetch orders:', results[0].reason);
        setOrders([]);
      }

      if (results[1].status === 'fulfilled') {
        const productsData = results[1].value.data;
        setProducts(productsData.data?.products || productsData.products || []);
      } else {
        console.error('Failed to fetch products:', results[1].reason);
        setProducts([]);
      }

      if (results[2].status === 'fulfilled') {
        const categoriesData = results[2].value.data;
        setCategories(categoriesData.data?.categories || categoriesData.categories || []);
      } else {
        console.error('Failed to fetch categories:', results[2].reason);
        setCategories([]);
      }
    } catch (error: unknown) {
      console.error('Error fetching admin data:', error);
      setError('حدث خطأ أثناء تحميل البيانات');
      toast.error('فشل تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      setOrders(
        orders.map((order) => (order._id === orderId ? { ...order, status: status as Order['status'] } : order))
      );
      toast.success('تم تحديث حالة الطلب');
    } catch (error: unknown) {
      console.error('Error updating order:', error);
      const message = getErrorMessage(error, 'فشل تحديث حالة الطلب');
      toast.error(message);
    }
  };

  const handleAddProduct = async (formData: FormData) => {
    try {
      await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('تم إضافة المنتج بنجاح');
      fetchData();
      setActiveTab('products');
    } catch (error: unknown) {
      console.error('Error adding product:', error);
      const message = getErrorMessage(error, 'فشل إضافة المنتج');
      toast.error(message);
      throw error;
    }
  };

  const handleAddCategory = async (data: {
    name: string;
    type: 'mobile' | 'accessory' | 'other';
    description: string;
    order: number;
  }) => {
    try {
      await api.post('/categories', data);
      toast.success('تم إضافة القسم بنجاح');
      fetchData();
      setActiveTab('categories');
    } catch (error: unknown) {
      console.error('Error adding category:', error);
      const message = getErrorMessage(error, 'فشل إضافة القسم');
      toast.error(message);
      throw error;
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا القسم؟')) return;

    try {
      await api.delete(`/categories/${id}`);
      toast.success('تم حذف القسم');
      fetchData();
    } catch (error: unknown) {
      console.error('Error deleting category:', error);
      const message = getErrorMessage(error, 'فشل حذف القسم');
      toast.error(message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    try {
      await api.delete(`/products/${id}`);
      toast.success('تم حذف المنتج');
      fetchData();
    } catch (error: unknown) {
      console.error('Error deleting product:', error);
      const message = getErrorMessage(error, 'فشل حذف المنتج');
      toast.error(message);
    }
  };

  const handleQuickShopSale = async (product: Product) => {
    if (product.stock <= 0) {
      toast.error('المنتج غير متوفر (المخزون 0)');
      return;
    }

    if (!window.confirm(`هل تريد تسجيل بيع قطعة واحدة من "${product.name}" داخل المحل؟`)) return;

    try {
      await api.put(`/products/${product._id}`, {
        stock: product.stock - 1,
      });

      setProducts(products.map((p) => (p._id === product._id ? { ...p, stock: p.stock - 1 } : p)));

      toast.success('تم خصم القطعة من المخزون بنجاح');
    } catch (error: unknown) {
      console.error('Error updating stock:', error);
      const message = getErrorMessage(error, 'حدث خطأ أثناء تحديث المخزون');
      toast.error(message);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === 'pending').length,
    totalProducts: products.length,
    totalRevenue: orders.filter((o) => o.status === 'delivered').reduce((sum, o) => sum + (o.totalAmount || 0), 0),
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-nile text-primary-foreground">
        <div className="container mx-auto py-6">
          <h1 className="text-2xl md:text-3xl font-bold">لوحة التحكم</h1>
          <p className="text-primary-foreground/80 mt-1">إدارة المتجر</p>
        </div>
      </div>

      <div className="container mx-auto py-8">
        {/* Stats */}
        <AdminStats
          totalOrders={stats.totalOrders}
          pendingOrders={stats.pendingOrders}
          totalProducts={stats.totalProducts}
          totalRevenue={stats.totalRevenue}
        />

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-6 text-center">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchData} className="mt-2">
              إعادة المحاولة
            </Button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            variant={activeTab === 'orders' ? 'default' : 'outline'}
            onClick={() => setActiveTab('orders')}
            className="gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            الطلبات ({orders.length})
          </Button>
          <Button
            variant={activeTab === 'products' ? 'default' : 'outline'}
            onClick={() => setActiveTab('products')}
            className="gap-2"
          >
            <Package className="w-4 h-4" />
            المنتجات ({products.length})
          </Button>
          <Button
            variant={activeTab === 'categories' ? 'default' : 'outline'}
            onClick={() => setActiveTab('categories')}
            className="gap-2"
          >
            <Tag className="w-4 h-4" />
            الأقسام ({categories.length})
          </Button>
          <Button
            variant={activeTab === 'add-product' ? 'secondary' : 'outline'}
            onClick={() => setActiveTab('add-product')}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            إضافة منتج
          </Button>
          <Button
            variant={activeTab === 'add-category' ? 'secondary' : 'outline'}
            onClick={() => setActiveTab('add-category')}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            إضافة قسم
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'orders' && orders.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-2xl border border-border">
                <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground">لا توجد طلبات</p>
              </div>
            ) : activeTab === 'orders' ? (
              <OrdersList orders={orders} onUpdateStatus={updateOrderStatus} />
            ) : null}

            {activeTab === 'products' && products.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-2xl border border-border">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground">لا توجد منتجات</p>
              </div>
            ) : activeTab === 'products' ? (
              <ProductsList
                products={products}
                onQuickShopSale={handleQuickShopSale}
                onDelete={handleDeleteProduct}
              />
            ) : null}

            {activeTab === 'categories' && categories.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-2xl border border-border">
                <Tag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-foreground">لا توجد أقسام</p>
              </div>
            ) : activeTab === 'categories' ? (
              <CategoriesList categories={categories} onDelete={handleDeleteCategory} />
            ) : null}

            {activeTab === 'add-product' && <ProductForm categories={categories} onSubmit={handleAddProduct} />}

            {activeTab === 'add-category' && <CategoryForm onSubmit={handleAddCategory} />}
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;