import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, SlidersHorizontal } from 'lucide-react';
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
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  const brands = ['Samsung', 'Apple', 'Xiaomi', 'Oppo', 'Vivo', 'Realme', 'Huawei', 'Honor'];

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.categories || response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchParams.get('search')) params.append('search', searchParams.get('search')!);
      if (searchParams.get('category')) params.append('category', searchParams.get('category')!);
      if (searchParams.get('brand')) params.append('brand', searchParams.get('brand')!);
      if (searchParams.get('minPrice')) params.append('minPrice', searchParams.get('minPrice')!);
      if (searchParams.get('maxPrice')) params.append('maxPrice', searchParams.get('maxPrice')!);

      const response = await api.get(`/products?${params.toString()}`);
      setProducts(response.data.products || response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedBrand) params.set('brand', selectedBrand);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    setSearchParams(params);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedBrand('');
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({});
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedBrand || minPrice || maxPrice;

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">المتجر</h1>
          <p className="text-muted-foreground mt-1">تصفح جميع المنتجات</p>
        </div>
      </div>

      <div className="container mx-auto py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="bg-card rounded-2xl border border-border p-6 sticky top-24 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  الفلاتر
                </h2>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive">
                    مسح الكل
                  </Button>
                )}
              </div>

              {/* Search */}
              <div>
                <label className="text-sm font-medium mb-2 block">البحث</label>
                <Input
                  type="text"
                  placeholder="ابحث عن منتج..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Categories */}
              <div>
                <label className="text-sm font-medium mb-2 block">القسم</label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                      !selectedCategory ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                  >
                    الكل
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === cat.slug ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand */}
              <div>
                <label className="text-sm font-medium mb-2 block">الماركة</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full h-11 px-4 rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none"
                >
                  <option value="">كل الماركات</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">نطاق السعر (ج.م)</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="من"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="إلى"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              <Button onClick={applyFilters} className="w-full" variant="secondary">
                تطبيق الفلاتر
              </Button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4 flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(true)}
                className="flex-1 gap-2"
              >
                <Filter className="w-4 h-4" />
                الفلاتر
                {hasActiveFilters && (
                  <span className="w-5 h-5 bg-secondary text-secondary-foreground rounded-full text-xs flex items-center justify-center">
                    !
                  </span>
                )}
              </Button>
            </div>

            {/* Active Filters Tags */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    البحث: {searchQuery}
                    <button onClick={() => { setSearchQuery(''); applyFilters(); }}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    القسم: {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
                    <button onClick={() => { setSelectedCategory(''); applyFilters(); }}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedBrand && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                    الماركة: {selectedBrand}
                    <button onClick={() => { setSelectedBrand(''); applyFilters(); }}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Products Grid */}
            <ProductGrid
              products={products}
              isLoading={isLoading}
              emptyMessage="لا توجد منتجات مطابقة للبحث"
            />
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setShowFilters(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-card shadow-xl animate-slide-in-right">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-bold text-lg">الفلاتر</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
              {/* Search */}
              <div>
                <label className="text-sm font-medium mb-2 block">البحث</label>
                <Input
                  type="text"
                  placeholder="ابحث عن منتج..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Categories */}
              <div>
                <label className="text-sm font-medium mb-2 block">القسم</label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                      !selectedCategory ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                    }`}
                  >
                    الكل
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === cat.slug ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand */}
              <div>
                <label className="text-sm font-medium mb-2 block">الماركة</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full h-11 px-4 rounded-lg border-2 border-input bg-background focus:border-primary focus:outline-none"
                >
                  <option value="">كل الماركات</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">نطاق السعر (ج.م)</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="من"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="إلى"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card flex gap-2">
              <Button variant="outline" onClick={clearFilters} className="flex-1">
                مسح الكل
              </Button>
              <Button variant="secondary" onClick={applyFilters} className="flex-1">
                تطبيق
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;
