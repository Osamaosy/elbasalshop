import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, User, MessageSquare, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { getImageUrl, formatPrice } from '@/lib/api';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    city: 'رشيد',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('يرجى تسجيل الدخول أولاً');
      navigate('/login');
      return;
    }

    if (items.length === 0) {
      toast.error('السلة فارغة');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        products: items.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        customerInfo: formData,
      };

      const response = await api.post('/orders', orderData);
      const { order, whatsappLink } = response.data.data;

      clearCart();
      
      toast.success('تم إرسال الطلب بنجاح! 🎉');

      // Open WhatsApp
      if (whatsappLink) {
        window.open(whatsappLink, '_blank');
      }

      // Navigate to orders page
      setTimeout(() => {
        navigate('/orders');
      }, 1500);

    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || 'فشل إرسال الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <h2 className="text-2xl font-bold text-foreground mb-4">سجل دخول أولاً</h2>
          <Button onClick={() => navigate('/login')} variant="secondary" size="lg">
            تسجيل الدخول
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <h2 className="text-2xl font-bold text-foreground mb-4">السلة فارغة</h2>
          <Button onClick={() => navigate('/shop')} variant="secondary" size="lg">
            تصفح المنتجات
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">إتمام الطلب</h1>
          <p className="text-muted-foreground mt-1">أكمل بياناتك لإرسال الطلب</p>
        </div>
      </div>

      <div className="container mx-auto py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 space-y-6" noValidate>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">معلومات التوصيل</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">الاسم الكامل *</label>
                    <div className="relative">
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="أدخل اسمك"
                        className="pl-10"
                        required
                      />
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">رقم الهاتف *</label>
                    <div className="relative">
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="01xxxxxxxxx"
                        className="pl-10"
                        required
                      />
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">العنوان بالتفصيل *</label>
                    <div className="relative">
                      <Input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="الشارع، رقم المبنى، الدور"
                        className="pl-10"
                        required
                      />
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">المدينة *</label>
                    <Input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="رشيد"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">ملاحظات إضافية</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="أي ملاحظات للتوصيل..."
                      className="w-full h-24 px-4 py-3 rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl border border-border p-6 sticky top-24 space-y-4">
              <h2 className="text-lg font-bold text-foreground">ملخص الطلب</h2>

              {/* Products */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product._id} className="flex gap-3">
                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden shrink-0">
                      <img
                        src={getImageUrl(item.product.images?.[0])}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} × {formatPrice(item.product.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-sm pt-4 border-t border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المجموع الفرعي</span>
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
                  type="submit"
                  variant="cta"
                  size="lg"
                  className="w-full gap-2"
                  disabled={isSubmitting || !formData.name || !formData.phone || !formData.address}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      تأكيد الطلب
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                سيتم التواصل معك عبر واتساب لتأكيد الطلب
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;