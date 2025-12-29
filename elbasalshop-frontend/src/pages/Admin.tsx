import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Package, Plus, ShoppingBag, Tag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
// تأكد ان Product و Order و Category معرفين بشكل صحيح في types
import { Order, Product, Category } from '@/types'; 
import { toast } from 'sonner';

import AdminStats from '@/components/admin/AdminStats';
import OrdersList from '@/components/admin/OrdersList';
import ProductsList from '@/components/admin/ProductsList';
import ProductForm from '@/components/admin/ProductForm';
import CategoriesList from '@/components/admin/CategoriesList';
import CategoryForm from '@/components/admin/CategoryForm';

// تعريف الأنواع (يفضل نقلها لملف types.ts مستقبلاً)
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// تعريف دقيق لشكل البيانات للإحصائيات
interface DashboardData {
  stats: {
    totalOrders: number;
    pendingOrders: number;
    totalProducts: number;
    totalRevenue: number;
  };
  lowStockProducts: Product[];
  topViewedProducts: Product[];
  topRatedProducts: Product[];
}

const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  const apiError = error as ApiError;
  return apiError.response?.data?.message || defaultMessage;
};

const Admin: React.FC = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  
  // ✅ 1. تم دمج الـ State وحذف التكرار
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: { totalOrders: 0, pendingOrders: 0, totalProducts: 0, totalRevenue: 0 },
    lowStockProducts: [],
    topViewedProducts: [],
    topRatedProducts: []
  });

  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'categories' | 'add-product' | 'add-category'>(
    'orders'
  );

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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
        api.get('/orders/admin/stats')
      ]);

      // 1. معالجة الطلبات
      if (results[0].status === 'fulfilled') {
        const ordersData = results[0].value.data;
        // معالجة هيكلية الاستجابة سواء كانت مباشرة أو داخل data
        setOrders(ordersData.data?.orders || ordersData.orders || []);
      } else {
        console.error('Failed to fetch orders:', results[0].reason);
      }

      // 2. معالجة المنتجات
      if (results[1].status === 'fulfilled') {
        const productsData = results[1].value.data;
        setProducts(productsData.data?.products || productsData.products || []);
      } else {
        console.error('Failed to fetch products:', results[1].reason);
      }

      // 3. معالجة الأقسام
      if (results[2].status === 'fulfilled') {
        const categoriesData = results[2].value.data;
        setCategories(categoriesData.data?.categories || categoriesData.categories || []);
      } else {
        console.error('Failed to fetch categories:', results[2].reason);
      }

      // 4. ✅ معالجة بيانات لوحة التحكم والإحصائيات
      if (results[3].status === 'fulfilled') {
        const statsData = results[3].value.data;
        // التأكد من وجود البيانات قبل تحديث الـ State
        const payload = statsData.data || statsData; // Fallback incase data isn't nested
        
        // دمج البيانات الجديدة مع القيم الافتراضية لتجنب الـ undefined
        setDashboardData(prev => ({
            ...prev,
            ...payload
        }));
      } else {
        console.error('Failed to fetch admin stats:', results[3].reason);
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
      // تحديث الإحصائيات (اختياري)
      fetchData();
    } catch (error: unknown) {
      console.error('Error updating order:', error);
      const message = getErrorMessage(error, 'فشل تحديث حالة الطلب');
      toast.error(message);
    }
  };

  const handleProductSubmit = async (formData: FormData) => {
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('تم تحديث المنتج بنجاح');
      } else {
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('تم إضافة المنتج بنجاح');
      }
      setEditingProduct(null);
      fetchData();
      setActiveTab('products');
    } catch (error: unknown) {
      console.error('Error saving product:', error);
      const message = getErrorMessage(error, editingProduct ? 'فشل تحديث المنتج' : 'فشل إضافة المنتج');
      toast.error(message);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setActiveTab('add-product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setActiveTab('products');
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
    if (!window.confirm(`هل تريد تسجيل بيع قطعة واحدة من "${product.name}" داخل المحل؟ (سيتم تسجيل طلب مدفوع)`)) return;

    try {
      const { data } = await api.post('/orders/pos', {
        productId: product._id
      });
      // تحديث المخزون محلياً
      setProducts(products.map((p) => (p._id === product._id ? { ...p, stock: data.data.updatedStock } : p)));
      toast.success('تم تسجيل عملية البيع بنجاح ✅');
      fetchData();
    } catch (error: unknown) {
      console.error('Error recording sale:', error);
      const message = getErrorMessage(error, 'حدث خطأ أثناء تسجيل البيع');
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

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <div className="bg-gradient-nile text-primary-foreground">
        <div className="container mx-auto py-6">
          <h1 className="text-2xl md:text-3xl font-bold">لوحة التحكم</h1>
          <p className="text-primary-foreground/80 mt-1">إدارة المتجر</p>
        </div>
      </div>

      <div className="container mx-auto py-8">
        {/* Stats */}
        <AdminStats
          stats={dashboardData.stats}
          lowStockProducts={dashboardData.lowStockProducts}
          topViewedProducts={dashboardData.topViewedProducts}
          topRatedProducts={dashboardData.topRatedProducts}
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
            onClick={() => { setActiveTab('orders'); setEditingProduct(null); }}
            className="gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            الطلبات ({orders.length})
          </Button>
          <Button
            variant={activeTab === 'products' ? 'default' : 'outline'}
            onClick={() => { setActiveTab('products'); setEditingProduct(null); }}
            className="gap-2"
          >
            <Package className="w-4 h-4" />
            المنتجات ({products.length})
          </Button>
          <Button
            variant={activeTab === 'categories' ? 'default' : 'outline'}
            onClick={() => { setActiveTab('categories'); setEditingProduct(null); }}
            className="gap-2"
          >
            <Tag className="w-4 h-4" />
            الأقسام ({categories.length})
          </Button>
          <Button
            variant={activeTab === 'add-product' ? 'secondary' : 'outline'}
            onClick={() => { setActiveTab('add-product'); setEditingProduct(null); }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            {editingProduct ? 'تعديل منتج' : 'إضافة منتج'}
          </Button>
          <Button
            variant={activeTab === 'add-category' ? 'secondary' : 'outline'}
            onClick={() => { setActiveTab('add-category'); setEditingProduct(null); }}
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
                onEdit={handleEditProduct}
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

            {activeTab === 'add-product' && (
              <ProductForm
                categories={categories}
                onSubmit={handleProductSubmit}
                initialData={editingProduct}
                onCancel={handleCancelEdit}
              />
            )}

            {activeTab === 'add-category' && <CategoryForm onSubmit={handleAddCategory} />}
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;