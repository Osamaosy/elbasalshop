import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { getImageUrl, formatPrice } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  
  // ✅ استخدام discountPrice بدلاً من oldPrice
  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <Link to={`/product/${product._id}`} className="group block">
      <div className="bg-card rounded-2xl shadow-md overflow-hidden border border-border hover:shadow-xl hover:border-primary/20 transition-all duration-300 h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={getImageUrl(product.images?.[0] || product.mainImage)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
          
          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {discount > 0 && (
              <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded-lg">
                خصم {discount}%
              </span>
            )}
            {product.stock <= 0 && (
              <span className="bg-muted text-muted-foreground text-xs font-bold px-2 py-1 rounded-lg">
                نفذت الكمية
              </span>
            )}
            {/* ✅ استخدام isFeatured بدلاً من featured */}
            {product.isFeatured && product.stock > 0 && (
              <span className="bg-gold text-foreground text-xs font-bold px-2 py-1 rounded-lg">
                مميز
              </span>
            )}
          </div>

          {/* Hover Actions */}
          <div className="absolute inset-0 bg-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full shadow-lg"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
            <Button variant="default" size="icon" className="rounded-full shadow-lg">
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Category */}
          {typeof product.category === 'object' && product.category?.name && (
            <span className="text-xs text-muted-foreground mb-1">
              {product.category.name}
            </span>
          )}

          {/* Name */}
          <h3 className="font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Brand */}
          {product.brand && (
            <span className="text-xs text-muted-foreground mb-2">{product.brand}</span>
          )}

          {/* Price */}
          <div className="mt-auto flex items-center gap-2">
            {/* ✅ عرض السعر بعد الخصم أولاً إذا كان موجوداً */}
            <span className="text-lg font-bold text-secondary">
              {formatPrice(product.discountPrice || product.price)}
            </span>
            {product.discountPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="mt-2">
            {product.stock > 0 ? (
              <span className="text-xs text-success flex items-center gap-1">
                <span className="w-2 h-2 bg-success rounded-full"></span>
                متوفر ({product.stock} قطعة)
              </span>
            ) : (
              <span className="text-xs text-destructive flex items-center gap-1">
                <span className="w-2 h-2 bg-destructive rounded-full"></span>
                غير متوفر
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;