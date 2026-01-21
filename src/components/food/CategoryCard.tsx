import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/api';

interface CategoryCardProps {
  category: Category;
  variant?: 'default' | 'compact';
  className?: string;
}

export const CategoryCard = ({ category, variant = 'default', className }: CategoryCardProps) => {
  if (variant === 'compact') {
    return (
      <Link
        to={`/menu?category=${category.id}`}
        className={cn(
          'flex flex-col items-center gap-2 px-1',
          className
        )}
      >
        <div className="relative h-16 w-16 overflow-hidden rounded-full bg-secondary ring-2 ring-transparent transition-all hover:ring-primary">
          <img 
            src={category.image} 
            alt={category.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <span className="text-xs font-medium text-center line-clamp-1">
          {category.name}
        </span>
      </Link>
    );
  }

  return (
    <Link
      to={`/menu?category=${category.id}`}
      className={cn(
        'food-card relative flex flex-col items-center justify-end overflow-hidden rounded-xl bg-card p-4 shadow-card aspect-[4/5]',
        className
      )}
    >
      <img 
        src={category.image} 
        alt={category.name}
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
      <div className="relative text-center">
        <h3 className="font-bold text-card text-lg">{category.name}</h3>
        <span className="text-xs text-card/80">{category.itemCount} items</span>
      </div>
    </Link>
  );
};
