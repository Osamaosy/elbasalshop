import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Package, Plus, Users, ShoppingBag, TrendingUp, Clock, CheckCircle, Truck, XCircle, Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import api, { API_BASE_URL, formatPrice } from '@/lib/api';
import { Order, Product, Category } from '@/types';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: { label: 'قيد الانتظار', icon: Clock, color: 'bg-warning text-foreground' },
  confirmed: { label: 'تم التأكيد', icon: CheckCircle, color: 'bg-primary text-primary-foreground' },
  shipped: { label: 'جاري الشحن', icon: Truck, color: 'bg-secondary text-secondary-foreground' },
  delivered: { label: 'تم التوصيل', icon: CheckCircle, color: 'bg-success text-accent-foreground' },
  cancelled: { label: 'ملغي', icon: XCircle, color: 'bg-destructive text-destructive-foreground' },
};

const Admin: React.FC = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'add'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Product Form
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    oldPrice: '',
    category: '',
    brand: '',
    stock: '',
  });
  const [productImages, setProductImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ordersRes, productsRes, categoriesRes] = await Promise.all([
        api.get('/orders'),
        api.get('/products'),
        api.get('/categories'),
      ]);
      setOrders(ordersRes.data.orders || ordersRes.data || []);
      setProducts(productsRes.data.products || productsRes.data || []);
      setCategories(categoriesRes.data.categories || categoriesRes.data || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: status as Order['status'] } : order
      ));
      toast.success('تم تحديث حالة الطلب');
    } catch (error) {
      toast.error('فشل تحديث حالة الطلب');
    }
  };

  const handleProductFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProductForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setProductImages(Array.from(e.target.files));
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
      if (productForm.oldPrice) formData.append('oldPrice', productForm.oldPrice);
      formData.append('category', productForm.category);
      if (productForm.brand) formData.append('brand', productForm.brand);
      formData.append('stock', productForm.stock);
      
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
        oldPrice: '',
        category: '',
        brand: '',
        stock: '',
      });
      setProductImages([]);
      fetchData();
      setActiveTab('products');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل إضافة المنتج');
    } finally {
      setIsSubmitting(false);
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
    totalRevenue: orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.totalAmount, 0),
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

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <Button
            variant={activeTab === 'orders' ? 'default' : 'outline'}
            onClick={() => setActiveTab('orders')}
            className="gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            الطلبات
          </Button>
          <Button
            variant={activeTab === 'products' ? 'default' : 'outline'}
            onClick={() => setActiveTab('products')}
            className="gap-2"
          >
            <Package className="w-4 h-4" />
            المنتجات
          </Button>
          <Button
            variant={activeTab === 'add' ? 'secondary' : 'outline'}
            onClick={() => setActiveTab('add')}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            إضافة منتج
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
                    const status = statusConfig[order.status];
                    return (
                      <div key={order._id} className="bg-card rounded-2xl border border-border p-4 md:p-6">
                        <div className="flex flex-wrap gap-4 items-start justify-between mb-4">
                          <div>
                            <p className="font-mono text-sm text-muted-foreground">#{order._id.slice(-8)}</p>
                            <p className="font-bold text-foreground">{order.customerName}</p>
                            <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                            <p className="text-sm text-muted-foreground">{order.customerAddress}</p>
                          </div>
                          <div className="text-left">
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                            </p>
                            <p className="text-xl font-bold text-secondary">{formatPrice(order.totalAmount)}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 items-center justify-between pt-4 border-t border-border">
                          <div className="flex gap-2">
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
                {products.map((product) => (
                  <div key={product._id} className="bg-card rounded-xl border border-border overflow-hidden">
                    <div className="aspect-square bg-muted">
                      <img
                        src={product.images?.[0] ? `${API_BASE_URL}${product.images[0]}` : '/placeholder.svg'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>
                      <p className="text-secondary font-bold">{formatPrice(product.price)}</p>
                      <p className="text-xs text-muted-foreground">المخزون: {product.stock}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Product Tab */}
            {activeTab === 'add' && (
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
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">السعر القديم</label>
                        <Input
                          type="number"
                          name="oldPrice"
                          value={productForm.oldPrice}
                          onChange={handleProductFormChange}
                          placeholder="اختياري"
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
                          {categories.map(cat => (
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
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">صور المنتج</label>
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
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;
