import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import api, { getImageUrl, formatPrice } from '@/lib/api';
import { Product, Review } from '@/types';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // States للتقييم
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data.data.product);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }
    
    setIsSubmittingReview(true);
    try {
      await api.post(`/products/${id}/reviews`, { rating, comment });
      toast.success('تم إضافة تقييمك بنجاح');
      setComment('');
      fetchProduct();
    } catch (error) {
      // ✅ هنا نحدد أن الخطأ هو من نوع AxiosError ويحمل بيانات رسالة نصية
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || 'فشل إضافة التقييم');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) return <div className="text-center py-20">جاري التحميل...</div>;
  if (!product) return <div className="text-center py-20">المنتج غير موجود</div>;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* ... (الجزء العلوي الخاص بتفاصيل المنتج كما هو) ... */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {/* صور المنتج */}
        <div className="bg-card rounded-2xl p-4 border border-border">
            <img src={getImageUrl(product.mainImage || product.images?.[0])} alt={product.name} className="w-full h-auto rounded-xl" />
        </div>

        {/* تفاصيل المنتج */}
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-2">
                <div className="flex text-gold">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < Math.round(product.rating?.average || 0) ? 'fill-current' : 'text-gray-300'}`} />
                    ))}
                </div>
                <span className="text-muted-foreground">({product.rating?.count || 0} تقييم)</span>
            </div>
            <div className="text-2xl font-bold text-primary">{formatPrice(product.price)}</div>
            <p className="text-muted-foreground">{product.description}</p>
            <Button onClick={() => addToCart(product, 1)} className="w-full md:w-auto">
                <ShoppingCart className="mr-2 w-5 h-5" /> إضافة للسلة
            </Button>
        </div>
      </div>

      {/* قسم التقييمات الجديد */}
      <div className="bg-card rounded-2xl border border-border p-8 mt-12">
        <h2 className="text-2xl font-bold mb-6">التقييمات والمراجعات</h2>

        <div className="grid md:grid-cols-2 gap-12">
          {/* قائمة التقييمات */}
          <div className="space-y-6">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((review: Review) => (
                <div key={review._id} className="border-b border-border pb-4 last:border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-muted w-8 h-8 rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="font-semibold">{review.name}</span>
                    <div className="flex text-gold text-xs mr-auto">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                        ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">{review.comment}</p>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {new Date(review.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">لا توجد تقييمات بعد. كن أول من يقيم هذا المنتج!</p>
            )}
          </div>

          {/* نموذج إضافة تقييم */}
          <div className="bg-muted/30 p-6 rounded-xl h-fit">
            <h3 className="font-bold mb-4">أضف تقييمك</h3>
            {isAuthenticated ? (
              <form onSubmit={submitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">التقييم</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full p-2 rounded-md border border-input bg-background"
                  >
                    <option value="5">5 نجوم - ممتاز</option>
                    <option value="4">4 نجوم - جيد جداً</option>
                    <option value="3">3 نجوم - جيد</option>
                    <option value="2">2 نجوم - مقبول</option>
                    <option value="1">1 نجمة - سيء</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">تعليقك</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    rows={4}
                    placeholder="اكتب تجربتك مع المنتج..."
                    className="w-full p-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  ></textarea>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmittingReview}>
                  {isSubmittingReview ? 'جاري النشر...' : 'نشر التقييم'}
                </Button>
              </form>
            ) : (
              <div className="text-center py-8">
                <p className="mb-4 text-muted-foreground">يجب عليك تسجيل الدخول لإضافة تقييم</p>
                <Link to="/login">
                  <Button variant="outline">تسجيل الدخول</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;