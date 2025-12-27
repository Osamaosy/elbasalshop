import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, Truck, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import api, { formatPrice } from '@/lib/api';
import { Order } from '@/types';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: { label: 'قيد الانتظار', icon: Clock, color: 'text-warning bg-warning/10' },
  confirmed: { label: 'تم التأكيد', icon: CheckCircle, color: 'text-primary bg-primary/10' },
  processing: { label: 'قيد التجهيز', icon: Package, color: 'text-secondary bg-secondary/10' },
  shipped: { label: 'جاري الشحن', icon: Truck, color: 'text-secondary bg-secondary/10' },
  delivered: { label: 'تم التوصيل', icon: CheckCircle, color: 'text-success bg-success/10' },
  cancelled: { label: 'ملغي', icon: XCircle, color: 'text-destructive bg-destructive/10' },
};

const Orders: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/orders');
      const data = response.data;
      
      // Handle different response structures
      const ordersData = data.data?.orders || data.orders || data.data || [];
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      setError('فشل تحميل الطلبات');
      
      if (error.response?.status === 401) {
        toast.error('انتهت جلستك، يرجى تسجيل الدخول مرة أخرى');
      } else {
        toast.error('حدث خطأ أثناء تحميل الطلبات');
      }
      
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center animate-fade-in">
        <div className="text-center px-4">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">سجل دخول أولاً</h2>
          <p className="text-muted-foreground mb-6">لمتابعة طلباتك يجب تسجيل الدخول</p>
          <Link to="/login">
            <Button variant="secondary" size="lg">تسجيل الدخول</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">طلباتي</h1>
          <p className="text-muted-foreground mt-1">متابعة حالة طلباتك</p>
        </div>
      </div>

      <div className="container mx-auto py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">{error}</h2>
            <Button onClick={fetchOrders} variant="outline" className="mt-4">
              إعادة المحاولة
            </Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">لا توجد طلبات</h2>
            <p className="text-muted-foreground mb-6">لم تقم بأي طلبات بعد</p>
            <Link to="/shop">
              <Button variant="secondary" size="lg">تصفح المنتجات</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <div
                  key={order._id}
                  className="bg-card rounded-2xl border border-border p-4 md:p-6 animate-slide-up"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">رقم الطلب</p>
                      <p className="font-mono font-bold text-foreground">
                        {order.orderNumber || `#${order._id.slice(-8)}`}
                      </p>
                    </div>
                    <div className="text-right md:text-left">
                      <p className="text-sm text-muted-foreground">التاريخ</p>
                      <p className="font-medium text-foreground">
                        {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${status.color}`}>
                      <StatusIcon className="w-4 h-4" />
                      <span className="font-medium text-sm">{status.label}</span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">عدد المنتجات</p>
                        <p className="font-bold text-foreground">
                          {order.products?.length || order.items?.length || 0} منتج
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-muted-foreground">الإجمالي</p>
                        <p className="text-xl font-bold text-secondary">
                          {formatPrice(order.totalAmount || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;