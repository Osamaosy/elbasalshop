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
        <div key={category._id} className="bg-card rounded-xl border border-border p-6 group">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-bold text-lg">{category.name}</h3>
              <p className="text-sm text-muted-foreground">{category.slug}</p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onDelete(category._id)}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">النوع:</span> {category.type}
            </p>
            {category.description && <p className="text-muted-foreground">{category.description}</p>}
            <p>
              <span className="text-muted-foreground">الترتيب:</span> {category.order}
            </p>
            <p>
              <span
                className={`inline-block px-2 py-0.5 rounded text-xs ${
                  category.isActive ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                }`}
              >
                {category.isActive ? 'نشط' : 'معطل'}
              </span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoriesList;