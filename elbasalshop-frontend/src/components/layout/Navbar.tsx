import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, LogOut, Settings, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-md shadow-md border-b border-border">
      <div className="container mx-auto">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-3 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 bg-gradient-nile rounded-xl flex items-center justify-center shadow-md">
              <span className="text-primary-foreground font-bold text-lg">ب</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg text-primary leading-tight">البصال شوب</h1>
              <p className="text-xs text-muted-foreground">موبايلات وإكسسوارات</p>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="ابحث عن موبايل أو إكسسوار..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4"
              />
              <button
                type="submit"
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-secondary-foreground text-xs rounded-full flex items-center justify-center font-bold animate-bounce-subtle">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-2">
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Settings className="w-4 h-4" />
                      <span className="hidden lg:inline">لوحة التحكم</span>
                    </Button>
                  </Link>
                )}
                <Link to="/orders">
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Package className="w-4 h-4" />
                    <span className="hidden lg:inline">طلباتي</span>
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={logout} className="gap-1 text-destructive hover:text-destructive">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">خروج</span>
                </Button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">دخول</Button>
                </Link>
                <Link to="/register">
                  <Button variant="secondary" size="sm">تسجيل</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Navigation Links - Desktop */}
        <div className="hidden md:flex items-center gap-6 py-2 border-t border-border">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
            الرئيسية
          </Link>
          <Link to="/shop" className="text-sm font-medium hover:text-primary transition-colors">
            المتجر
          </Link>
          <Link to="/shop?category=mobiles" className="text-sm font-medium hover:text-primary transition-colors">
            موبايلات
          </Link>
          <Link to="/shop?category=accessories" className="text-sm font-medium hover:text-primary transition-colors">
            إكسسوارات
          </Link>
          <Link to="/shop?category=covers" className="text-sm font-medium hover:text-primary transition-colors">
            جرابات
          </Link>
          <Link to="/shop?category=chargers" className="text-sm font-medium hover:text-primary transition-colors">
            شواحن
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-card border-t border-border animate-slide-up">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="p-4 border-b border-border">
            <div className="relative">
              <Input
                type="text"
                placeholder="ابحث عن موبايل أو إكسسوار..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12"
              />
              <button
                type="submit"
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-muted-foreground"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Mobile Links */}
          <div className="p-4 space-y-2">
            <Link
              to="/"
              className="block py-2 px-4 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              الرئيسية
            </Link>
            <Link
              to="/shop"
              className="block py-2 px-4 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              المتجر
            </Link>
            <Link
              to="/shop?category=mobiles"
              className="block py-2 px-4 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              موبايلات
            </Link>
            <Link
              to="/shop?category=accessories"
              className="block py-2 px-4 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              إكسسوارات
            </Link>

            <div className="pt-4 border-t border-border space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2 text-sm text-muted-foreground">
                    مرحباً، {user?.name}
                  </div>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 py-2 px-4 rounded-lg hover:bg-muted transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      لوحة التحكم
                    </Link>
                  )}
                  <Link
                    to="/orders"
                    className="flex items-center gap-2 py-2 px-4 rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Package className="w-4 h-4" />
                    طلباتي
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full py-2 px-4 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex items-center gap-2 py-2 px-4 rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    تسجيل الدخول
                  </Link>
                  <Link
                    to="/register"
                    className="block py-2 px-4 rounded-lg bg-secondary text-secondary-foreground text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    إنشاء حساب
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
