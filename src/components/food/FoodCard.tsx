import { Plus, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { useCart } from '@/contexts/CartContext';
import type { MenuItem } from '@/lib/api';

interface FoodCardProps {
  item: MenuItem;
  variant?: 'default' | 'horizontal';
  className?: string;
}

export const FoodCard = ({ item, variant = 'default', className }: FoodCardProps) => {
  const { addItem } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(item, 1);
  };

  if (variant === 'horizontal') {
    return (
      <Link 
        to={`/menu/${item.id}`}
        className={cn(
          'food-card flex gap-3 rounded-xl bg-card p-3 shadow-card',
          !item.isAvailable && 'opacity-60',
          className
        )}
      >
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
          <img 
            src={item.image} 
            alt={item.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          {!item.isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <span className="text-xs font-medium text-muted-foreground">Sold Out</span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col justify-between py-1">
          <div>
            <h3 className="font-semibold text-sm line-clamp-1">{item.name}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
              {item.description}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <PriceDisplay price={item.price} originalPrice={item.originalPrice} size="sm" />
            {item.isAvailable && (
              <button
                onClick={handleQuickAdd}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-90"
                aria-label={`Add ${item.name} to cart`}
              >
                <Plus className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      to={`/menu/${item.id}`}
      className={cn(
        'food-card block rounded-xl bg-card p-3 shadow-card',
        !item.isAvailable && 'opacity-60',
        className
      )}
    >
      <div className="relative aspect-square overflow-hidden rounded-lg mb-3">
        <img 
          src={item.image} 
          alt={item.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {item.originalPrice && item.originalPrice > item.price && (
          <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
            SALE
          </span>
        )}
        {!item.isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <span className="text-sm font-medium text-muted-foreground">Sold Out</span>
          </div>
        )}
        {item.rating && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-card/90 px-2 py-0.5 backdrop-blur-sm">
            <Star className="h-3 w-3 fill-accent text-accent" />
            <span className="text-xs font-medium">{item.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
      <h3 className="font-semibold text-sm line-clamp-1">{item.name}</h3>
      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 mb-2">
        {item.description}
      </p>
      <div className="flex items-center justify-between">
        <PriceDisplay price={item.price} originalPrice={item.originalPrice} size="sm" />
        {item.isAvailable && (
          <button
            onClick={handleQuickAdd}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-90"
            aria-label={`Add ${item.name} to cart`}
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>
    </Link>
  );
};
