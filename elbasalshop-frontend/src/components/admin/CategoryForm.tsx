import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CategoryFormProps {
  onSubmit: (data: {
    name: string;
    type: 'mobile' | 'accessory' | 'other';
    description: string;
    order: number;
  }) => Promise<void>;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'mobile' as 'mobile' | 'accessory' | 'other',
    description: '',
    order: '0',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.type) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        name: formData.name,
        type: formData.type,
        description: formData.description,
        order: parseInt(formData.order) || 0,
      });

      setFormData({
        name: '',
        type: 'mobile',
        description: '',
        order: '0',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-card rounded-2xl border border-border p-6">
        <h2 className="text-xl font-bold text-foreground mb-6">إضافة قسم جديد</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">اسم القسم *</label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="مثال: موبايلات"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">نوع القسم *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full h-11 px-4 rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none"
              required
            >
              <option value="mobile">موبايل</option>
              <option value="accessory">إكسسوار</option>
              <option value="other">أخرى</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">الوصف</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="وصف القسم (اختياري)"
              className="w-full h-20 px-4 py-3 rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">ترتيب العرض</label>
            <Input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleChange}
              placeholder="0"
              min="0"
            />
            <p className="text-xs text-muted-foreground mt-1">الأقسام ذات الرقم الأقل تظهر أولاً</p>
          </div>

          <Button type="submit" variant="cta" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin ml-2" />
                جاري الإضافة...
              </>
            ) : (
              'إضافة القسم'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;