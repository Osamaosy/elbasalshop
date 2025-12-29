import React from 'react';
import { Clock, CheckCircle, Package, Truck, XCircle } from 'lucide-react';
import { Order } from '@/types';
import { formatPrice } from '@/lib/api';

interface OrdersListProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: string) => void;
}

const statusConfig = {
  pending: { label: 'قيد الانتظار', icon: Clock, color: 'bg-warning text-foreground' },
  confirmed: { label: 'تم التأكيد', icon: CheckCircle, color: 'bg-primary text-primary-foreground' },
  processing: { label: 'قيد التجهيز', icon: Package, color: 'bg-secondary text-secondary-foreground' },
  shipped: { label: 'جاري الشحن', icon: Truck, color: 'bg-secondary text-secondary-foreground' },
  delivered: { label: 'تم التوصيل', icon: CheckCircle, color: 'bg-success text-accent-foreground' },
  cancelled: { label: 'ملغي', icon: XCircle, color: 'bg-destructive text-destructive-foreground' },
};

const OrdersList: React.FC<OrdersListProps> = ({ orders, onUpdateStatus }) => {
  return (
    <div className="space-y-4">
      {orders.map((order) => {
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
                    onClick={() => onUpdateStatus(order._id, key)}
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
      })}
    </div>
  );
};

export default OrdersList;