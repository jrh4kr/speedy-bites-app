import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FoodCard } from '@/components/food/FoodCard';
import { mockMenuItems } from '@/data/mockData';

export const FavoritesPage = () => {
  const navigate = useNavigate();
  // Simulate some favorited items
  const [favorites] = useState(mockMenuItems.slice(0, 3));

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center gap-4 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold">Favorites</h1>
      </header>

      <main className="px-4 py-4">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Heart className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg mb-2">No favorites yet</h3>
            <p className="text-muted-foreground mb-6">
              Save your favorite meals for quick ordering
            </p>
            <Button onClick={() => navigate('/menu')}>
              Browse Menu
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {favorites.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default FavoritesPage;
