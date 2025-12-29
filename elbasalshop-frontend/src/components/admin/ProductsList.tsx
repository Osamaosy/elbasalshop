import React from 'react';
import { Eye, Store, Trash, Edit } from 'lucide-react'; // 1. استيراد أيقونة Edit
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { getImageUrl, formatPrice } from '@/lib/api';

interface ProductsListProps {
  products: Product[];
  onQuickShopSale: (product: Product) => void;
  onDelete: (productId: string) => void;
  onEdit: (product: Product) => void; // 2. إضافة دالة التعديل للواجهة
}

const ProductsList: React.FC<ProductsListProps> = ({ products, onQuickShopSale, onDelete, onEdit }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <div key={product._id} className="bg-card rounded-xl border border-border overflow-hidden group">
          <div className="aspect-square bg-muted relative">
            <img
              src={getImageUrl(product.images?.[0])}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />

            {/* أزرار التحكم */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              
              {/* زر التعديل الجديد */}
              <Button
                size="icon"
                onClick={() => onEdit(product)}
                title="تعديل المنتج"
                className="bg-blue-600 hover:bg-blue-700 text-white border-none h-9 w-9 rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                <Edit className="w-5 h-5" />
              </Button>

              <Button
                size="icon"
                onClick={() => onQuickShopSale(product)}
                title="بيع قطعة في المحل"
                className="bg-green-600 hover:bg-green-700 text-white border-none h-9 w-9 rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                <Store className="w-5 h-5" />
              </Button>

              <Button
                size="icon"
                onClick={() => onDelete(product._id)}
                title="حذف المنتج"
                className="bg-red-600 hover:bg-red-700 text-white border-none h-9 w-9 rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                <Trash className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="p-3">
            <h3 className="font-semibold text-sm line-clamp-1">{product.name}</h3>

            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1 mb-1">
              <Eye className="w-3 h-3" />
              <span>{product.views || 0} مشاهدة</span>
            </div>

            <p className="text-secondary font-bold">{formatPrice(product.price)}</p>
            <p className="text-xs text-muted-foreground">المخزون: {product.stock}</p>
            {product.isFeatured && (
              <span className="inline-block mt-1 text-xs bg-gold/20 text-gold px-2 py-0.5 rounded">
                مميز
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductsList;