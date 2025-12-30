import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { getImageUrl, formatPrice } from '@/lib/api';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center animate-fade-in">
        <div className="text-center px-4">
          <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">سلتك فارغة</h2>
          <p className="text-muted-foreground mb-6">لم تضف أي منتجات للسلة بعد</p>
          <Link to="/shop">
            <Button variant="secondary" size="lg" className="gap-2">
              تصفح المنتجات
              <ArrowLeft className="w-4 h-4" />
            </Button>
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
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">سلة التسوق</h1>
          <p className="text-muted-foreground mt-1">{totalItems} منتج</p>
        </div>
      </div>

      <div className="container mx-auto py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.product._id}
                className="bg-card rounded-2xl border border-border p-4 flex gap-4 animate-slide-up"
              >
                {/* Image */}
                <Link
                  to={`/product/${item.product._id}`}
                  className="w-24 h-24 shrink-0 bg-muted rounded-xl overflow-hidden"
                >
                  <img
                    src={getImageUrl(item.product.images?.[0])}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </Link>

                {/* Info */}
                <div className="flex-1 flex flex-col">
                  <Link
                    to={`/product/${item.product._id}`}
                    className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
                  >
                    {item.product.name}
                  </Link>
                  
                  <span className="text-lg font-bold text-secondary mt-1">
                    {formatPrice(item.product.price)}
                  </span>

                  <div className="flex items-center justify-between mt-auto">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-8 h-8"
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="w-8 h-8"
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Remove */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => removeFromCart(item.product._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Subtotal - Desktop */}
                <div className="hidden sm:flex flex-col items-end justify-between">
                  <span className="text-sm text-muted-foreground">الإجمالي</span>
                  <span className="text-xl font-bold text-foreground">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}

            {/* Clear Cart */}
            <div className="flex justify-end">
              <Button variant="ghost" className="text-destructive" onClick={clearCart}>
                <Trash2 className="w-4 h-4 ml-2" />
                تفريغ السلة
              </Button>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl border border-border p-6 sticky top-24 space-y-4">
              <h2 className="text-lg font-bold text-foreground">ملخص الطلب</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">عدد المنتجات</span>
                  <span className="font-medium">{totalItems}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المجموع الكلي</span>
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">التوصيل</span>
                  <span className="font-medium text-success">مجاني</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-foreground">الإجمالي</span>
                  <span className="text-2xl font-bold text-secondary">{formatPrice(totalPrice)}</span>
                </div>

                <Button
                  variant="cta"
                  size="lg"
                  className="w-full gap-2"
                  onClick={() => navigate('/checkout')}
                >
                  إتمام الطلب
                  <ArrowLeft className="w-4 h-4" />
                </Button>

                <Link to="/shop" className="block mt-3">
                  <Button variant="outline" className="w-full">
                    متابعة التسوق
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
