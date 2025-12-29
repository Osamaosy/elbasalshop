import React, { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Category } from '@/types';

interface ProductFormProps {
  categories: Category[];
  onSubmit: (formData: FormData) => Promise<void>;
}

const ProductForm: React.FC<ProductFormProps> = ({ categories, onSubmit }) => {
  const [formData, setFormData] = useState({
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length > 5) {
        alert('الحد الأقصى 5 صور');
        return;
      }
      setProductImages(files);
    }
  };

  const removeImage = (index: number) => {
    setProductImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.category || !formData.stock) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (formData.discountPrice && Number(formData.discountPrice) >= Number(formData.price)) {
      alert('عفواً، يجب أن يكون السعر بعد الخصم أقل من السعر الأساسي');
      return;
    }

    if (productImages.length === 0 && !imageUrls.trim()) {
      alert('يجب إضافة صورة واحدة على الأقل (ملف أو رابط)');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      if (formData.discountPrice) data.append('discountPrice', formData.discountPrice);
      data.append('category', formData.category);
      if (formData.brand) data.append('brand', formData.brand);
      data.append('stock', formData.stock);
      data.append('isFeatured', String(formData.isFeatured));

      productImages.forEach((image) => {
        data.append('images', image);
      });

      if (imageUrls.trim()) {
        const urls = imageUrls.split('\n').filter((url) => url.trim() !== '');
        urls.forEach((url) => {
          data.append('images', url.trim());
        });
      }

      await onSubmit(data);

      // تصفير النموذج
      setFormData({
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
      setImageUrls('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="text-xl font-bold text-foreground mb-6">إضافة منتج جديد</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">اسم المنتج *</label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="مثال: iPhone 15 Pro Max"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">الوصف</label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="وصف تفصيلي للمنتج..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">السعر (ج.م) *</label>
              <Input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
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
                value={formData.discountPrice}
                onChange={handleChange}
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
                value={formData.category}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none"
                required
              >
                <option value="">اختر القسم</option>
                {categories
                  .filter((c) => c.isActive)
                  .map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">الماركة</label>
              <Input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="مثال: Apple"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">المخزون *</label>
            <Input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
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
              checked={formData.isFeatured}
              onChange={handleChange}
              className="w-4 h-4 text-primary rounded"
            />
            <label htmlFor="isFeatured" className="text-sm font-medium">
              منتج مميز (سيظهر في الصفحة الرئيسية)
            </label>
          </div>

          <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
            <h3 className="font-semibold text-sm">صور المنتج</h3>

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
                        className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">أو / و</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">روابط صور خارجية (اختياري)</label>
              <Textarea
                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                value={imageUrls}
                onChange={(e) => setImageUrls(e.target.value)}
                className="font-mono text-xs"
                rows={3}
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                ضع كل رابط في سطر منفصل. يمكن استخدام هذه الروابط مع الصور المرفوعة أعلاه.
              </p>
            </div>
          </div>

          <Button type="submit" variant="cta" size="lg" className="w-full" disabled={isSubmitting}>
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
  );
};

export default ProductForm;