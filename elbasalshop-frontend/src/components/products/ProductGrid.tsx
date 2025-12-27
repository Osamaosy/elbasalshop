import React from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/types';
import { Loader2, PackageX } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyMessage?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  emptyMessage = 'لا توجد منتجات',
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">جاري تحميل المنتجات...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <PackageX className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground mb-2">{emptyMessage}</p>
          <p className="text-muted-foreground">جرب البحث بكلمات مختلفة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
