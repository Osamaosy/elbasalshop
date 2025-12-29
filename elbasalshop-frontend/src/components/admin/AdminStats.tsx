import React from 'react';
import { ShoppingBag, Clock, Package, TrendingUp } from 'lucide-react';
import { formatPrice } from '@/lib/api';

interface AdminStatsProps {
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  totalRevenue: number;
}

const AdminStats: React.FC<AdminStatsProps> = ({
  totalOrders,
  pendingOrders,
  totalProducts,
  totalRevenue,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{totalOrders}</p>
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
            <p className="text-2xl font-bold text-foreground">{pendingOrders}</p>
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
            <p className="text-2xl font-bold text-foreground">{totalProducts}</p>
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
            <p className="text-2xl font-bold text-foreground">{formatPrice(totalRevenue)}</p>
            <p className="text-xs text-muted-foreground">الإيرادات</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;