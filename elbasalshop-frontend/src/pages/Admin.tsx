import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Package, Plus, ShoppingBag, TrendingUp, Clock, CheckCircle, Truck, XCircle, Loader2, Upload, X, Tag, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import api, { formatPrice, getImageUrl } from '@/lib/api';
import { Order, Product, Category } from '@/types';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: { label: 'قيد الانتظار', icon: Clock, color: 'bg-warning text-foreground' },
  confirmed: { label: 'تم التأكيد', icon: CheckCircle, color: 'bg-primary text-primary-foreground' },
  processing: { label: 'قيد التجهيز', icon: Package, color: 'bg-secondary text-secondary-foreground' },
  shipped: { label: 'جاري الشحن', icon: Truck, color: 'bg-secondary text-secondary-foreground' },
  delivered: { label: 'تم التوصيل', icon: CheckCircle, color: 'bg-success text-accent-foreground' },
  cancelled: { label: 'ملغي', icon: XCircle, color: 'bg-destructive text-destructive-foreground' },
};

const Admin: React.FC = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'categories' | 'add-product' | 'add-category'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add Product Form
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    category: '',
    brand: '',
    stock: '',
    isFeatured: false,
  });
  const [productImages, setProductImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add Category Form
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    type: 'mobile' as 'mobile' | 'accessory' | 'other',
    description: '',
    order: '0',
  });

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

    } catch (error: any) {
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
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: status as Order['status'] } : order
      ));
      toast.success('تم تحديث حالة الطلب');
    } catch (error: any) {
      console.error('Error updating order:', error);
      toast.error(error.response?.data?.message || 'فشل تحديث حالة الطلب');
    }
  };

  const handleProductFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleCategoryFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setCategoryForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length > 5) {
        toast.error('الحد الأقصى 5 صور');
        return;
      }
      setProductImages(files);
    }
  };

  const removeImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productForm.name || !productForm.price || !productForm.category || !productForm.stock) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('price', productForm.price);
      if (productForm.discountPrice) formData.append('discountPrice', productForm.discountPrice);
      formData.append('category', productForm.category);
      if (productForm.brand) formData.append('brand', productForm.brand);
      formData.append('stock', productForm.stock);
      formData.append('isFeatured', String(productForm.isFeatured));
      
      productImages.forEach(image => {
        formData.append('images', image);
      });

      await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('تم إضافة المنتج بنجاح');
      setProductForm({
        name: '',
        description: '',
        price: '',
        discountPrice: '',
        category: '',
        brand: '',
        stock: '',
        isFeatured: false,
      });
      setProductImages([]);
      fetchData();
      setActiveTab('products');
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast.error(error.response?.data?.message || 'فشل إضافة المنتج');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryForm.name || !categoryForm.type) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post('/categories', {
        name: categoryForm.name,
        type: categoryForm.type,
        description: categoryForm.description,
        order: parseInt(categoryForm.order) || 0,
      });

      toast.success('تم إضافة القسم بنجاح');
      setCategoryForm({
        name: '',
        type: 'mobile',
        description: '',
        order: '0',
      });
      fetchData();
      setActiveTab('categories');
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast.error(error.response?.data?.message || 'فشل إضافة القسم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا القسم؟')) return;

    try {
      await api.delete(`/categories/${id}`);
      toast.success('تم حذف القسم');
      fetchData();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error(error.response?.data?.message || 'فشل حذف القسم');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;

    try {
      await api.delete(`/products/${id}`);
      toast.success('تم حذف المنتج');
      fetchData();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(error.response?.data?.message || 'فشل حذف المنتج');
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
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    totalProducts: products.length,
    totalRevenue: orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0),
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
                <p className="text-xs text-muted-foreground">إجمالي الطلبات</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center text-warning">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.pendingOrders}</p>
                <p className="text-xs text-muted-foreground">طلبات معلقة</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center text-secondary">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalProducts}</p>
                <p className="text-xs text-muted-foreground">المنتجات</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center text-success">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{formatPrice(stats.totalRevenue)}</p>
                <p className="text-xs text-muted-foreground">الإيرادات</p>
              </div>
            </div>
          </div>
        </div>

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
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center py-20 bg-card rounded-2xl border border-border">
                    <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-foreground">لا توجد طلبات</p>
                  </div>
                ) : (
                  orders.map((order) => {
                    const status = statusConfig[order.status] || statusConfig.pending;
                    return (
                      <div key={order._id} className="bg-card rounded-2xl border border-border p-4 md:p-6">
                        <div className="flex flex-wrap gap-4 items-start justify-between mb-4">
                          <div>
                            <p className="font-mono text-sm text-muted-foreground">#{order.orderNumber}</p>
                            <p className="font-bold text-foreground">{order.customerInfo.name}</p>
                            <p className="text-sm text-muted-foreground">{order.customerInfo.phone}</p>
                            <p className="text-sm text-muted-foreground">{order.customerInfo.address}</p>
                          </div>
                          <div className="text-left">
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                            </p>
                            <p className="text-xl font-bold text-secondary">{formatPrice(order.totalAmount)}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 items-center justify-between pt-4 border-t border-border">
                          <div className="flex gap-2 flex-wrap">
                            {Object.entries(statusConfig).map(([key, config]) => (
                              <button
                                key={key}
                                onClick={() => updateOrderStatus(order._id, key)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                  order.status === key ? config.color : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                              >
                                {config.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.length === 0 ? (
                  <div className="col-span-full text-center py-20 bg-card rounded-2xl border border-border">
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-foreground">لا توجد منتجات</p>
                  </div>
                ) : (
                  products.map((product) => (
                    <div key={product._id} className="bg-card rounded-xl border border-border overflow-hidden group">
                      <div className="aspect-square bg-muted relative">
                        <img
                          src={getImageUrl(product.images?.[0])}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            size="icon"
                            variant="secondary"
                            onClick={() => handleDeleteProduct(product._id)}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>
                        <p className="text-secondary font-bold">{formatPrice(product.price)}</p>
                        <p className="text-xs text-muted-foreground">المخزون: {product.stock}</p>
                        {product.isFeatured && (
                          <span className="inline-block mt-1 text-xs bg-gold/20 text-gold px-2 py-0.5 rounded">
                            مميز
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.length === 0 ? (
                  <div className="col-span-full text-center py-20 bg-card rounded-2xl border border-border">
                    <Tag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-foreground">لا توجد أقسام</p>
                  </div>
                ) : (
                  categories.map((category) => (
                    <div key={category._id} className="bg-card rounded-xl border border-border p-6 group">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">{category.slug}</p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteCategory(category._id)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">النوع:</span> {category.type}</p>
                        {category.description && (
                          <p className="text-muted-foreground">{category.description}</p>
                        )}
                        <p><span className="text-muted-foreground">الترتيب:</span> {category.order}</p>
                        <p>
                          <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                            category.isActive ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                          }`}>
                            {category.isActive ? 'نشط' : 'معطل'}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Add Product Tab */}
            {activeTab === 'add-product' && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="text-xl font-bold text-foreground mb-6">إضافة منتج جديد</h2>
                  
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">اسم المنتج *</label>
                      <Input
                        type="text"
                        name="name"
                        value={productForm.name}
                        onChange={handleProductFormChange}
                        placeholder="مثال: iPhone 15 Pro Max"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">الوصف</label>
                      <textarea
                        name="description"
                        value={productForm.description}
                        onChange={handleProductFormChange}
                        placeholder="وصف تفصيلي للمنتج..."
                        className="w-full h-24 px-4 py-3 rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">السعر (ج.م) *</label>
                        <Input
                          type="number"
                          name="price"
                          value={productForm.price}
                          onChange={handleProductFormChange}
                          placeholder="السعر"
                          required
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">السعر بعد الخصم</label>
                        <Input
                          type="number"
                          name="discountPrice"
                          value={productForm.discountPrice}
                          onChange={handleProductFormChange}
                          placeholder="اختياري"
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">القسم *</label>
                        <select
                          name="category"
                          value={productForm.category}
                          onChange={handleProductFormChange}
                          className="w-full h-11 px-4 rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none"
                          required
                        >
                          <option value="">اختر القسم</option>
                          {categories.filter(c => c.isActive).map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">الماركة</label>
                        <Input
                          type="text"
                          name="brand"
                          value={productForm.brand}
                          onChange={handleProductFormChange}
                          placeholder="مثال: Apple"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">المخزون *</label>
                      <Input
                        type="number"
                        name="stock"
                        value={productForm.stock}
                        onChange={handleProductFormChange}
                        placeholder="عدد القطع المتوفرة"
                        required
                        min="0"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isFeatured"
                        name="isFeatured"
                        checked={productForm.isFeatured}
                        onChange={handleProductFormChange}
                        className="w-4 h-4 text-primary rounded"
                      />
                      <label htmlFor="isFeatured" className="text-sm font-medium">
                        منتج مميز (سيظهر في الصفحة الرئيسية)
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">صور المنتج (حد أقصى 5)</label>
                      <div className="border-2 border-dashed border-input rounded-lg p-6 text-center">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="product-images"
                        />
                        <label htmlFor="product-images" className="cursor-pointer">
                          <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">اضغط لرفع الصور</p>
                        </label>
                      </div>
                      
                      {productImages.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {productImages.map((image, index) => (
                            <div key={index} className="relative w-20 h-20">
                              <img
                                src={URL.createObjectURL(image)}
                                alt={`Preview ${index}`}
                                className="w-full h-full object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      variant="cta"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin ml-2" />
                          جاري الإضافة...
                        </>
                      ) : (
                        'إضافة المنتج'
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            )}

            {/* Add Category Tab */}
            {activeTab === 'add-category' && (
              <div className="max-w-xl mx-auto">
                <div className="bg-card rounded-2xl border border-border p-6">
                  <h2 className="text-xl font-bold text-foreground mb-6">إضافة قسم جديد</h2>
                  
                  <form onSubmit={handleAddCategory} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">اسم القسم *</label>
                      <Input
                        type="text"
                        name="name"
                        value={categoryForm.name}
                        onChange={handleCategoryFormChange}
                        placeholder="مثال: موبايلات"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">نوع القسم *</label>
                      <select
                        name="type"
                        value={categoryForm.type}
                        onChange={handleCategoryFormChange}
                        className="w-full h-11 px-4 rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none"
                        required
                      >
                        <option value="mobile">موبايل</option>
                        <option value="accessory">إكسسوار</option>
                        <option value="other">أخرى</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">الوصف</label>
                      <textarea
                        name="description"
                        value={categoryForm.description}
                        onChange={handleCategoryFormChange}
                        placeholder="وصف القسم (اختياري)"
                        className="w-full h-20 px-4 py-3 rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">ترتيب العرض</label>
                      <Input
                        type="number"
                        name="order"
                        value={categoryForm.order}
                        onChange={handleCategoryFormChange}
                        placeholder="0"
                        min="0"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        الأقسام ذات الرقم الأقل تظهر أولاً
                      </p>
                    </div>

                    <Button
                      type="submit"
                      variant="cta"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin ml-2" />
                          جاري الإضافة...
                        </>
                      ) : (
                        'إضافة القسم'
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;