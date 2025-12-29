import React, { useState } from 'react';
import { 
  TrendingUp, AlertTriangle, Eye, Star, DollarSign, 
  ShoppingBag, Package, ChevronUp, ChevronRight, ChevronLeft 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getImageUrl, formatPrice } from '@/lib/api';

// تعريف الأنواع (Types)
export interface ProductStat {
  _id: string;
  name: string;
  price: number;
  mainImage?: string;
  stock?: number;
  views?: number;
  rating?: { average: number; count: number };
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  totalRevenue: number;
}

export interface AdminStatsProps {
  stats?: DashboardStats; // جعلناها اختيارية لتجنب الأخطاء
  lowStockProducts?: ProductStat[];
  topViewedProducts?: ProductStat[];
  topRatedProducts?: ProductStat[];
}


const ITEMS_PER_PAGE = 5;

// مكون القائمة الداخلية مع Pagination
const PaginatedList: React.FC<{
  title: string;
  icon: React.ReactNode;
  data: ProductStat[];
  type: 'stock' | 'views' | 'rating';
  colorClass: string;
  bgClass: string;
}> = ({ title, icon, data = [], type, colorClass, bgClass }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // حماية إضافية ضد البيانات الفارغة
  const safeData = Array.isArray(data) ? data : [];
  
  const totalPages = Math.ceil(safeData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentData = safeData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const nextPage = () => setCurrentPage(p => Math.min(totalPages, p + 1));
  const prevPage = () => setCurrentPage(p => Math.max(1, p - 1));

  return (
    <Card className={`h-full flex flex-col ${type === 'stock' ? 'border-red-200 shadow-sm' : ''}`}>
      <CardHeader className={`pb-3 ${bgClass} rounded-t-xl`}>
        <div className="flex justify-between items-center">
          <CardTitle className={`text-base font-bold flex items-center gap-2 ${colorClass}`}>
            {icon}
            {title}
          </CardTitle>
          <span className="text-xs font-normal text-muted-foreground bg-white/50 px-2 py-1 rounded-full">
            {safeData.length} منتج
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-4 flex-1 flex flex-col">
        <div className="space-y-4 flex-1 min-h-[300px]">
          {currentData.map(p => (
            <div key={p._id} className="flex items-center gap-3 border-b border-gray-100 pb-2 last:border-0">
              <img src={getImageUrl(p.mainImage)} alt={p.name} className="w-10 h-10 rounded-md object-cover bg-muted" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" title={p.name}>{p.name}</p>
                <p className="text-xs text-muted-foreground">{formatPrice(p.price)}</p>
              </div>
              
              {type === 'stock' && (
                <div className="text-red-600 font-bold text-sm bg-red-100 px-2 py-1 rounded">
                  {p.stock} قطع
                </div>
              )}
              
              {type === 'views' && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="w-3 h-3" />
                  {p.views || 0}
                </div>
              )}

              {type === 'rating' && (
                <div className="flex items-center gap-1 text-xs font-bold text-yellow-600">
                  <Star className="w-3 h-3 fill-current" />
                  {p.rating?.average?.toFixed(1) || 0}
                </div>
              )}
            </div>
          ))}
          {safeData.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">لا توجد بيانات</p>}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 pt-2 border-t text-xs">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={prevPage} 
              disabled={currentPage === 1}
              className="h-8 px-2"
            >
              <ChevronRight className="w-4 h-4 ml-1" /> السابق
            </Button>
            <span className="text-muted-foreground">
              {currentPage} / {totalPages}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={nextPage} 
              disabled={currentPage === totalPages}
              className="h-8 px-2"
            >
              التالي <ChevronLeft className="w-4 h-4 mr-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ✅ هنا الحل الرئيسي: إضافة قيم افتراضية (Default Values)
const AdminStats: React.FC<AdminStatsProps> = ({ 
  stats = { totalOrders: 0, pendingOrders: 0, totalProducts: 0, totalRevenue: 0 }, 
  lowStockProducts = [], 
  topViewedProducts = [], 
  topRatedProducts = [] 
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // استخدام القيم الافتراضية بأمان
  const safeStats = stats || { totalOrders: 0, pendingOrders: 0, totalProducts: 0, totalRevenue: 0 };

  return (
    <div className="space-y-8">
      {/* 1. الكروت الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبيعات (المسلمة)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatPrice(safeStats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">أرباح صافية</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.totalOrders}</div>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-xs text-orange-600 bg-orange-100 px-1 rounded">{safeStats.pendingOrders} قيد الانتظار</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عدد المنتجات</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeStats.totalProducts}</div>
          </CardContent>
        </Card>

        {/* زر التحكم في الإظهار */}
        <Card 
          className="cursor-pointer hover:bg-accent/50 transition-colors flex flex-col justify-center items-center border-dashed"
          onClick={() => setShowDetails(!showDetails)}
        >
          <div className="text-primary flex flex-col items-center gap-2 p-4">
            {showDetails ? <ChevronUp className="w-8 h-8" /> : <TrendingUp className="w-8 h-8" />}
            <span className="font-bold text-sm">
              {showDetails ? 'إخفاء التحليلات التفصيلية' : 'عرض التحليلات التفصيلية'}
            </span>
          </div>
        </Card>
      </div>

      {/* 2. الجداول التفصيلية */}
      {showDetails && (
        <div className="grid md:grid-cols-3 gap-6 animate-fade-in">
          <PaginatedList 
            title="أوشكت على النفاذ" 
            icon={<AlertTriangle className="w-5 h-5" />} 
            data={lowStockProducts} 
            type="stock"
            colorClass="text-red-700"
            bgClass="bg-red-50/50"
          />

          <PaginatedList 
            title="الأكثر مشاهدة" 
            icon={<Eye className="w-5 h-5" />} 
            data={topViewedProducts} 
            type="views"
            colorClass="text-blue-700"
            bgClass="bg-blue-50/50"
          />

          <PaginatedList 
            title="الأعلى تقييماً" 
            icon={<Star className="w-5 h-5" />} 
            data={topRatedProducts} 
            type="rating"
            colorClass="text-yellow-700"
            bgClass="bg-yellow-50/50"
          />
        </div>
      )}
    </div>
  );
};

export default AdminStats;