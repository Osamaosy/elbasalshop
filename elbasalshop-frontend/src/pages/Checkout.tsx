import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, MapPin, Phone, User, FileText, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import api, { getImageUrl, formatPrice } from '@/lib/api';
import toast from 'react-hot-toast';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    customerName: user?.name || '',
    customerPhone: user?.phone || '',
    customerAddress: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName || !formData.customerPhone || !formData.customerAddress) {
      toast.error('يرجى ملء جميع البيانات المطلوبة');
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
          quantity: item.quantity
        })),
        customerInfo: {
          name: formData.customerName,
          phone: formData.customerPhone,
          address: formData.customerAddress,
          city: 'Rashid'
        },
        notes: formData.notes
      };

      const response = await api.post('/orders', orderData);

      // ✅ تصحيح قراءة البيانات
      const responseData = response.data; // Axios response data
      
      if (responseData.success) {
        setOrderSuccess(true);
        clearCart();
        toast.success('تم إرسال الطلب بنجاح!');

        // ✅ الوصول الصحيح لرابط الواتساب (داخل data.data)
        const whatsappLink = responseData.data?.whatsappLink;
        
        if (whatsappLink) {
          // تأخير بسيط لضمان عدم حظر المتصفح للنافذة المنبثقة
          setTimeout(() => {
            window.open(whatsappLink, '_blank');
          }, 1000);
        }
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء إرسال الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !orderSuccess) {
    navigate('/cart');
    return null;
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center animate-fade-in">
        <div className="text-center px-4 max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-success/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">تم إرسال طلبك بنجاح!</h2>
          <p className="text-muted-foreground mb-6">
            سيتم التواصل معك قريباً عبر الواتساب لتأكيد الطلب والتنسيق للتوصيل.
          </p>
          <div className="space-y-3">
            <Link to="/orders">
              <Button variant="secondary" size="lg" className="w-full">
                متابعة طلباتي
              </Button>
            </Link>
            <Link to="/shop">
              <Button variant="outline" size="lg" className="w-full">
                متابعة التسوق
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto py-6">
          <nav className="flex items-center gap-2 text-sm mb-2">
            <Link to="/cart" className="text-muted-foreground hover:text-primary transition-colors">
              سلة التسوق
            </Link>
            <ArrowRight className="w-4 h-4 text-muted-foreground rotate-180" />
            <span className="text-foreground font-medium">إتمام الطلب</span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">إتمام الطلب</h1>
        </div>
      </div>

      <div className="container mx-auto py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  بيانات العميل
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      الاسم الكامل <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      placeholder="أدخل اسمك الكامل"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      رقم الهاتف <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="tel"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleChange}
                      placeholder="01xxxxxxxxx"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  عنوان التوصيل
                </h2>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    العنوان بالتفصيل <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="text"
                    name="customerAddress"
                    value={formData.customerAddress}
                    onChange={handleChange}
                    placeholder="مثال: شارع النيل، بجوار مسجد..."
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    * التوصيل متاح داخل رشيد والمناطق المجاورة
                  </p>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  ملاحظات إضافية
                </h2>

                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="أي ملاحظات أو طلبات خاصة..."
                  className="w-full h-24 px-4 py-3 rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none resize-none"
                />
              </div>

              {!isAuthenticated && (
                <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 text-center">
                  <p className="text-sm text-foreground">
                    <Link to="/login" className="text-primary font-bold hover:underline">سجل دخول</Link>
                    {' '}لتتمكن من متابعة طلباتك لاحقاً
                  </p>
                </div>
              )}

              <Button
                type="submit"
                variant="cta"
                size="xl"
                className="w-full gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري إرسال الطلب...
                  </>
                ) : (
                  <>
                    <Phone className="w-5 h-5" />
                    تأكيد الطلب وإرسال واتساب
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl border border-border p-6 sticky top-24 space-y-4">
              <h2 className="text-lg font-bold text-foreground">ملخص الطلب</h2>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product._id} className="flex gap-3">
                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden shrink-0">
                      <img
                        src={getImageUrl(item.product.images?.[0])}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        الكمية: {item.quantity}
                      </p>
                      <p className="text-sm font-bold text-secondary">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المجموع الفرعي</span>
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">التوصيل</span>
                  <span className="font-medium text-success">مجاني</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-foreground">الإجمالي</span>
                  <span className="text-2xl font-bold text-secondary">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;