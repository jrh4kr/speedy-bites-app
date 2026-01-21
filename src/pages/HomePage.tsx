import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { FoodCard } from '@/components/food/FoodCard';
import { CategoryCard } from '@/components/food/CategoryCard';
import { PromoCarousel } from '@/components/promo/PromoBanner';
import { StickyCartButton } from '@/components/cart/StickyCartButton';
import { mockCategories, mockMenuItems, promoBanners } from '@/data/mockData';

export const HomePage = () => {
  const featuredItems = mockMenuItems.filter(item => item.isFeatured);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pb-4">
        {/* Search Bar */}
        <div className="px-4 mb-5">
          <Link 
            to="/menu"
            className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 shadow-card"
          >
            <Search className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground">Search for meals...</span>
          </Link>
        </div>

        {/* Promo Banners */}
        <section className="mb-6">
          <PromoCarousel promos={promoBanners} />
        </section>

        {/* Categories */}
        <section className="mb-6">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-lg font-bold">Categories</h2>
            <Link to="/menu" className="text-sm font-medium text-primary">
              See All
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 -mx-4 pb-2">
            {mockCategories.slice(0, 6).map(category => (
              <CategoryCard 
                key={category.id} 
                category={category} 
                variant="compact"
                className="flex-shrink-0"
              />
            ))}
          </div>
        </section>

        {/* Featured Items */}
        <section className="mb-6">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-lg font-bold">Featured</h2>
            <Link to="/menu?featured=true" className="text-sm font-medium text-primary">
              See All
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 -mx-4 pb-2">
            {featuredItems.map(item => (
              <FoodCard 
                key={item.id} 
                item={item}
                className="flex-shrink-0 w-44"
              />
            ))}
          </div>
        </section>

        {/* Popular Items */}
        <section className="px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Popular Near You</h2>
            <Link to="/menu" className="text-sm font-medium text-primary">
              See All
            </Link>
          </div>
          <div className="space-y-3">
            {mockMenuItems.slice(0, 4).map(item => (
              <FoodCard 
                key={item.id} 
                item={item}
                variant="horizontal"
              />
            ))}
          </div>
        </section>
      </main>

      <StickyCartButton />
    </div>
  );
};

export default HomePage;
