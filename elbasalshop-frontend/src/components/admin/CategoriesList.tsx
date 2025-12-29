import React from 'react';
import { Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Category } from '@/types';

interface CategoriesListProps {
  categories: Category[];
  onDelete: (categoryId: string) => void;
}

const CategoriesList: React.FC<CategoriesListProps> = ({ categories, onDelete }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => (
        <div key={category._id} className="bg-card rounded-xl border border-border p-6 group relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-bold text-lg">{category.name}</h3>
              {/* عرض Slug فقط إذا كان موجوداً */}
              <p className="text-xs text-muted-foreground font-mono mt-1">{category.slug}</p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="text-destructive hover:bg-destructive/10 transition-colors"
              onClick={() => onDelete(category._id)}
              title="حذف القسم"
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-2 text-sm mt-4 pt-4 border-t border-border/50">
            <div className="flex justify-between">
              <span className="text-muted-foreground">النوع:</span>
              <span className="font-medium">{category.type === 'mobile' ? 'موبايل' : category.type === 'accessory' ? 'إكسسوار' : 'آخر'}</span>
            </div>
            
            {category.description && (
              <div className="text-muted-foreground text-xs line-clamp-2 mt-2">
                {category.description}
              </div>
            )}
            
            <div className="flex justify-between items-center mt-3">
              <span className="text-muted-foreground text-xs">الترتيب: {category.order}</span>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  category.isActive 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}
              >
                {category.isActive ? 'نشط' : 'معطل'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoriesList;