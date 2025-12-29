import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowRight, Minus, Plus, Check, Truck, Shield, Package, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api, { getImageUrl, formatPrice } from '@/lib/api';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import ProductGrid from '@/components/products/ProductGrid';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/products/${id}`);
      const productData = response.data.data?.product || response.data.product;
      setProduct(productData);

      // Fetch related products
      if (productData.category) {
        const categoryId = typeof productData.category === 'object'
          ? productData.category._id
          : productData.category;
        const relatedRes = await api.get(`/products?category=${categoryId}&limit=4`);
        const related = (relatedRes.data.data?.products || relatedRes.data.products || [])
          .filter((p: Product) => p._id !== id);
        setRelatedProducts(related.slice(0, 4));
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/shop');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(q => q + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">المنتج غير موجود</h2>
          <Link to="/shop">
            <Button>العودة للمتجر</Button>
          </Link>
        </div>
      </div>
    );
  }

  // ✅ حساب الخصم باستخدام discountPrice
  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Breadcrumb */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
              الرئيسية
            </Link>
            <ArrowRight className="w-4 h-4 text-muted-foreground rotate-180" />
            <Link to="/shop" className="text-muted-foreground hover:text-primary transition-colors">
              المتجر
            </Link>
            <ArrowRight className="w-4 h-4 text-muted-foreground rotate-180" />
            <span className="text-foreground font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto py-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-card rounded-2xl border border-border overflow-hidden">
              <img
                src={getImageUrl(product.images?.[selectedImage] || product.mainImage)}
                alt={product.name}
                className="w-full h-full object-contain p-4"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            </div>

            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 shrink-0 rounded-xl border-2 overflow-hidden transition-all ${selectedImage === index
                        ? 'border-primary shadow-md'
                        : 'border-border hover:border-primary/50'
                      }`}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {discount > 0 && (
                <span className="bg-destructive text-destructive-foreground text-sm font-bold px-3 py-1 rounded-lg">
                  خصم {discount}%
                </span>
              )}
              {product.stock > 0 ? (
                <span className="bg-success/10 text-success text-sm font-bold px-3 py-1 rounded-lg flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  متوفر
                </span>
              ) : (
                <span className="bg-destructive/10 text-destructive text-sm font-bold px-3 py-1 rounded-lg">
                  غير متوفر
                </span>
              )}
              {/* ✅ استخدام isFeatured */}
              {product.isFeatured && (
                <span className="bg-gold/20 text-gold text-sm font-bold px-3 py-1 rounded-lg">
                  منتج مميز
                </span>
              )}
            </div>

            {/* Title */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{product.name}</h1>
              {product.brand && (
                <p className="text-muted-foreground">الماركة: {product.brand}</p>
              )}
              <div className="flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-full">
                <Eye className="w-3 h-3" />
                <span>{product.views || 0} مشاهدة</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              {/* ✅ عرض السعر بعد الخصم أولاً إذا كان موجوداً */}
              <span className="text-3xl font-bold text-secondary">
                {formatPrice(product.discountPrice || product.price)}
              </span>
              {product.discountPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">الوصف</h3>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-3">المواصفات</h3>
                <div className="bg-muted rounded-xl p-4 space-y-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{key}</span>
                      <span className="font-medium text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            {product.stock > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">الكمية:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={incrementQuantity}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    (متوفر {product.stock} قطعة)
                  </span>
                </div>

                <Button
                  variant="cta"
                  size="xl"
                  className="w-full gap-2"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-5 h-5" />
                  أضف للسلة
                </Button>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-2">
                  <Truck className="w-6 h-6" />
                </div>
                <p className="text-xs font-medium">توصيل سريع</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-2">
                  <Shield className="w-6 h-6" />
                </div>
                <p className="text-xs font-medium">ضمان حقيقي</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-2">
                  <Package className="w-6 h-6" />
                </div>
                <p className="text-xs font-medium">منتج أصلي</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">منتجات مشابهة</h2>
            <ProductGrid products={relatedProducts} />
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;