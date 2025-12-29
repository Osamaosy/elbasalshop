import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload, X } from 'lucide-react';
import { Category, Product } from '@/types';
import { toast } from 'sonner';

interface ProductFormProps {
  categories: Category[];
  onSubmit: (formData: FormData) => Promise<void>;
  initialData?: Product | null;
  onCancel?: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ categories, onSubmit, initialData, onCancel }) => {
  // تجميع كل البيانات في حالة واحدة كما في الكود القديم
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
  const [imageUrls, setImageUrls] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ملء البيانات عند التعديل
  useEffect(() => {
    if (initialData) {
      setProductForm({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price.toString() || '',
        discountPrice: initialData.discountPrice?.toString() || '',
        category: typeof initialData.category === 'object' ? initialData.category._id : initialData.category,
        brand: initialData.brand || '',
        stock: initialData.stock.toString() || '',
        isFeatured: initialData.isFeatured || false,
      });

      // وضع روابط الصور الحالية في حقل الروابط للتعديل
      if (initialData.images && initialData.images.length > 0) {
        setImageUrls(initialData.images.join('\n'));
      }
    }
  }, [initialData]);

  const handleProductFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length + productImages.length > 5) {
        toast.error('الحد الأقصى 5 صور');
        return;
      }
      setProductImages(prev => [...prev, ...files]);
    }
  };

  const removeImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productForm.name || !productForm.price || !productForm.category || !productForm.stock) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (productForm.discountPrice && Number(productForm.discountPrice) >= Number(productForm.price)) {
      toast.error('عفواً، يجب أن يكون السعر بعد الخصم أقل من السعر الأساسي');
      return;
    }

    // التحقق من وجود صور (إما ملفات جديدة أو روابط موجودة)
    if (productImages.length === 0 && !imageUrls.trim()) {
      toast.error('يجب إضافة صورة واحدة على الأقل (ملف أو رابط)');
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

      // 1. إضافة الصور المرفوعة (الملفات)
      productImages.forEach(image => {
        formData.append('images', image);
      });

      // 2. إضافة روابط الصور الخارجية
      if (imageUrls.trim()) {
        const urls = imageUrls.split('\n').filter(url => url.trim() !== '');
        urls.forEach(url => {
          formData.append('images', url.trim());
        });
      }

      await onSubmit(formData);
      
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-foreground">
            {initialData ? 'تعديل المنتج' : 'إضافة منتج جديد'}
          </h2>
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel} size="sm">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Textarea
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
              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <label htmlFor="isFeatured" className="text-sm font-medium cursor-pointer select-none">
              منتج مميز (سيظهر في الصفحة الرئيسية)
            </label>
          </div>

          <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
            <h3 className="font-semibold text-sm">صور المنتج</h3>

            {/* خيار 1: رفع ملفات */}
            <div>
              <label className="block text-sm font-medium mb-2">رفع صور من الجهاز</label>
              <div className="border-2 border-dashed border-input rounded-lg p-6 text-center bg-background">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="product-images"
                />
                <label htmlFor="product-images" className="cursor-pointer block">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">اضغط لاختيار صور (Max 5)</p>
                </label>
              </div>
              
              {/* عرض الصور المرفوعة */}
              {productImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {productImages.map((image, index) => (
                    <div key={index} className="relative w-16 h-16">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Preview ${index}`}
                        className="w-full h-full object-cover rounded-md border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center text-xs hover:bg-destructive/90"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-muted/20 px-2 text-muted-foreground">أو / و</span>
              </div>
            </div>

            {/* خيار 2: روابط خارجية */}
            <div>
              <label className="block text-sm font-medium mb-2">روابط صور خارجية (اختياري)</label>
              <Textarea
                placeholder={`https://example.com/image1.jpg\nhttps://example.com/image2.jpg`}
                value={imageUrls}
                onChange={(e) => setImageUrls(e.target.value)}
                className="font-mono text-xs"
                rows={3}
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                ضع كل رابط في سطر منفصل.
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              variant="cta" // تأكد من أن هذا المتغير (variant) مدعوم في Button أو استخدم 'default'
              size="lg"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin ml-2" />
                  جاري الحفظ...
                </>
              ) : (
                initialData ? 'حفظ التعديلات' : 'إضافة المنتج'
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" size="lg" onClick={onCancel} disabled={isSubmitting}>
                إلغاء
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;