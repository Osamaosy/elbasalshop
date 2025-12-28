import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProductGrid from '@/components/products/ProductGrid';
import api from '@/lib/api';
import { Product, Category } from '@/types';

const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, [searchParams]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      const search = searchParams.get('search');
      const category = searchParams.get('category');

      if (search) params.append('search', search);
      if (category) params.append('category', category);

      const [productsRes, categoriesRes] = await Promise.all([
        api.get(`/products?${params.toString()}`),
        api.get('/categories'),
      ]);

      setProducts(productsRes.data.data?.products || productsRes.data.products || []);
      
      // ✅ فقط الأقسام النشطة مرتبة
      const cats = categoriesRes.data.data?.categories || categoriesRes.data.categories || [];
      setCategories(cats.filter((c: Category) => c.isActive).sort((a: Category, b: Category) => a.order - b.order));
    } catch (error) {
      console.error('Error fetching data:', error);
      setProducts([]);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const handleCategoryChange = (categorySlug: string) => {
    const params = new URLSearchParams(searchParams);
    if (categorySlug) {
      params.set('category', categorySlug);
    } else {
      params.delete('category');
    }
    setSelectedCategory(categorySlug);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSearchParams(new URLSearchParams());
  };

  // ✅ الحصول على اسم القسم المحدد
  const getSelectedCategoryName = () => {
    if (!selectedCategory) return 'جميع المنتجات';
    const cat = categories.find(c => c.slug === selectedCategory);
    return cat?.name || 'جميع المنتجات';
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">المتجر</h1>
          <p className="text-muted-foreground mt-1">
            {getSelectedCategoryName()} ({products.length} منتج)
          </p>
        </div>
      </div>

      <div className="container mx-auto py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-bold text-foreground mb-4">الأقسام</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryChange('')}
                  className={`w-full text-right px-4 py-2 rounded-lg transition-colors ${
                    !selectedCategory
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  جميع المنتجات
                </button>
                {categories.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => handleCategoryChange(category.slug)}
                    className={`w-full text-right px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.slug
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="ابحث عن منتج..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12"
                  />
                  <button
                    type="submit"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </form>

              <Button
                variant="outline"
                className="lg:hidden gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4" />
                الفلاتر
              </Button>

              {(searchQuery || selectedCategory) && (
                <Button variant="ghost" onClick={clearFilters} className="gap-2">
                  <X className="w-4 h-4" />
                  إعادة تعيين
                </Button>
              )}
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="lg:hidden bg-card rounded-2xl border border-border p-6 animate-slide-up">
                <h3 className="font-bold text-foreground mb-4">الأقسام</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      handleCategoryChange('');
                      setShowFilters(false);
                    }}
                    className={`w-full text-right px-4 py-2 rounded-lg transition-colors ${
                      !selectedCategory
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    جميع المنتجات
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category._id}
                      onClick={() => {
                        handleCategoryChange(category.slug);
                        setShowFilters(false);
                      }}
                      className={`w-full text-right px-4 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.slug
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            <div>
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-muted-foreground">
                      {products.length} منتج
                      {selectedCategory && ` في ${getSelectedCategoryName()}`}
                    </p>
                  </div>

                  <ProductGrid
                    products={products}
                    isLoading={isLoading}
                    emptyMessage={
                      searchQuery || selectedCategory
                        ? 'لا توجد نتائج مطابقة للبحث'
                        : 'لا توجد منتجات'
                    }
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;