import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Minus, Plus, Heart, Share2, Star } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { PriceDisplay, formatPrice } from '@/components/ui/PriceDisplay';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';
import { mockMenuItems } from '@/data/mockData';
import { toast } from 'sonner';

export const MealDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const item = mockMenuItems.find(i => i.id === id);

  if (!item) {
    return (
      <div className="min-h-screen bg-background lg:min-h-0 lg:bg-transparent">
        <Header showBack />
        <div className="flex flex-col items-center justify-center px-4 py-20">
          <p className="text-muted-foreground">Item not found</p>
          <Button onClick={() => navigate('/menu')} className="mt-4">
            Back to Menu
          </Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(item, quantity);
    toast.success(`${quantity}x ${item.name} added to cart!`);
  };

  const totalPrice = item.price * quantity;

  return (
    <div className="min-h-screen bg-background pb-24 lg:min-h-0 lg:bg-transparent lg:pb-0">
      {/* Hero Image */}
      <div className="relative h-72 bg-muted">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/20 to-transparent" />
        
        {/* Header overlay */}
        <div className="absolute top-0 left-0 right-0">
          <Header showBack transparent showCart />
        </div>

        {/* Action buttons */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full bg-card/90 backdrop-blur-sm shadow-card transition-colors',
              isFavorite && 'bg-primary text-primary-foreground'
            )}
          >
            <Heart className={cn('h-5 w-5', isFavorite && 'fill-current')} />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-card/90 backdrop-blur-sm shadow-card">
            <Share2 className="h-5 w-5" />
          </button>
        </div>

        {/* Discount badge */}
        {item.originalPrice && item.originalPrice > item.price && (
          <div className="absolute top-20 left-4 rounded-full bg-primary px-3 py-1">
            <span className="text-sm font-bold text-primary-foreground">
              {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative -mt-6 rounded-t-3xl bg-background px-4 pt-6">
        {/* Category & Rating */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-primary">{item.category}</span>
          {item.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="text-sm font-medium">{item.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Name */}
        <h1 className="text-2xl font-bold mb-2">{item.name}</h1>

        {/* Price */}
        <PriceDisplay 
          price={item.price} 
          originalPrice={item.originalPrice}
          size="xl"
          className="mb-4"
        />

        {/* Description */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-muted-foreground leading-relaxed">{item.description}</p>
        </div>

        {/* Availability */}
        {!item.isAvailable && (
          <div className="mb-6 rounded-lg bg-destructive/10 px-4 py-3">
            <p className="text-sm font-medium text-destructive">
              This item is currently unavailable
            </p>
          </div>
        )}

        {/* Quantity Selector */}
        {item.isAvailable && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Quantity</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center rounded-full bg-secondary">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-muted disabled:opacity-40"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  disabled={quantity >= 10}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-sm text-muted-foreground">Max 10 per order</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-card px-4 py-4 shadow-bottom-nav safe-bottom">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <span className="text-sm text-muted-foreground">Total</span>
            <p className="text-xl font-bold">{formatPrice(totalPrice)}</p>
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={!item.isAvailable}
            className="h-14 flex-1 text-base font-semibold"
            size="lg"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MealDetailsPage;
