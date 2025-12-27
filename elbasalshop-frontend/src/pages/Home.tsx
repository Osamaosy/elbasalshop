import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Smartphone, Headphones, BatteryCharging, Sparkles, Truck, Shield, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductGrid from '@/components/products/ProductGrid';
import api from '@/lib/api';
import { Product, Category } from '@/types';

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/products?limit=8'),
          api.get('/categories'),
        ]);

        const products = productsRes.data.products || productsRes.data || [];
        setFeaturedProducts(products.filter((p: Product) => p.featured).slice(0, 4));
        setNewProducts(products.slice(0, 8));
        setCategories(categoriesRes.data.categories || categoriesRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Set demo data for preview
        setNewProducts([]);
        setCategories([
          { _id: '1', name: 'موبايلات', slug: 'mobiles', description: 'أحدث الهواتف الذكية' },
          { _id: '2', name: 'إكسسوارات', slug: 'accessories', description: 'ملحقات الموبايل' },
          { _id: '3', name: 'جرابات', slug: 'covers', description: 'جرابات وأغطية' },
          { _id: '4', name: 'شواحن', slug: 'chargers', description: 'شواحن وكوابل' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const categoryIcons: Record<string, React.ReactNode> = {
    mobiles: <Smartphone className="w-8 h-8" />,
    accessories: <Headphones className="w-8 h-8" />,
    chargers: <BatteryCharging className="w-8 h-8" />,
    covers: <Sparkles className="w-8 h-8" />,
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        
        <div className="container mx-auto py-16 md:py-24 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-right space-y-6">
              <div className="inline-flex items-center gap-2 bg-secondary/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                <Sparkles className="w-4 h-4" />
                <span>أفضل العروض في رشيد</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                البصال شوب
                <br />
                <span className="text-secondary">موبايلات وإكسسوارات</span>
              </h1>
              
              <p className="text-lg md:text-xl text-primary-foreground/80 max-w-lg mx-auto md:mx-0">
                أحدث الهواتف الذكية وجميع ملحقاتها بأفضل الأسعار في رشيد، البحيرة. ضمان حقيقي وخدمة ما بعد البيع.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link to="/shop">
                  <Button variant="cta" size="xl" className="w-full sm:w-auto gap-2">
                    تسوق الآن
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/shop?category=mobiles">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                    عروض الموبايلات
                  </Button>
                </Link>
              </div>
            </div>

            <div className="hidden md:flex justify-center">
              <div className="relative">
                <div className="w-72 h-72 bg-secondary/30 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
                <div className="relative z-10 animate-float">
                  <Smartphone className="w-48 h-48 text-primary-foreground/80" strokeWidth={0.5} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(210 20% 98%)"/>
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="py-8 bg-background">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-sm">توصيل سريع</p>
                <p className="text-xs text-muted-foreground">لكل رشيد</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-sm">ضمان حقيقي</p>
                <p className="text-xs text-muted-foreground">على كل المنتجات</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-sm">دفع عند الاستلام</p>
                <p className="text-xs text-muted-foreground">كاش أو فودافون كاش</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-sm">دعم فني</p>
                <p className="text-xs text-muted-foreground">24/7 واتساب</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-background">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">تصفح الأقسام</h2>
              <p className="text-muted-foreground mt-1">اختر القسم اللي تحتاجه</p>
            </div>
            <Link to="/shop">
              <Button variant="ghost" className="gap-1">
                عرض الكل
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(categories.length > 0 ? categories : [
              { _id: '1', name: 'موبايلات', slug: 'mobiles' },
              { _id: '2', name: 'إكسسوارات', slug: 'accessories' },
              { _id: '3', name: 'جرابات', slug: 'covers' },
              { _id: '4', name: 'شواحن', slug: 'chargers' },
            ]).map((category) => (
              <Link
                key={category._id}
                to={`/shop?category=${category.slug}`}
                className="group"
              >
                <div className="relative bg-card border border-border rounded-2xl p-6 text-center hover:border-primary hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      {categoryIcons[category.slug] || <Sparkles className="w-8 h-8" />}
                    </div>
                    <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-12 bg-muted">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">منتجات مميزة</h2>
                <p className="text-muted-foreground mt-1">أفضل المنتجات المختارة لك</p>
              </div>
              <Link to="/shop?featured=true">
                <Button variant="ghost" className="gap-1">
                  عرض الكل
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <ProductGrid products={featuredProducts} isLoading={isLoading} />
          </div>
        </section>
      )}

      {/* New Products */}
      <section className="py-12 bg-background">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">أحدث المنتجات</h2>
              <p className="text-muted-foreground mt-1">وصل حديثاً</p>
            </div>
            <Link to="/shop">
              <Button variant="ghost" className="gap-1">
                عرض الكل
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {newProducts.length > 0 ? (
            <ProductGrid products={newProducts} isLoading={isLoading} />
          ) : (
            <div className="text-center py-16 bg-card rounded-2xl border border-border">
              <Smartphone className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">قريباً...</h3>
              <p className="text-muted-foreground mb-4">نجهز لكم أفضل المنتجات</p>
              <p className="text-sm text-muted-foreground">تأكد من تشغيل الـ Backend على المنفذ 5000</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-nile text-primary-foreground">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">محتاج مساعدة؟</h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            تواصل معنا على الواتساب وهنساعدك تختار الموبايل أو الإكسسوار المناسب ليك
          </p>
          <a
            href="https://wa.me/201234567890"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="cta" size="xl" className="gap-2">
              تواصل واتساب
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;
