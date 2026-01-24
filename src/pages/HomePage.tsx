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
    <div className="min-h-screen bg-background lg:min-h-0 lg:bg-transparent">
      <Header />
      
      <main className="pb-4 lg:pb-0">
        {/* Search Bar - Hidden on desktop */}
        <div className="px-4 mb-5 lg:hidden">
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
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Categories</h2>
            <Link to="/menu" className="text-sm font-medium text-primary">
              See All
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6 pb-2 lg:overflow-visible lg:px-0 lg:mx-0 lg:grid lg:grid-cols-6 lg:gap-4">
            {mockCategories.slice(0, 6).map(category => (
              <CategoryCard 
                key={category.id} 
                category={category} 
                variant="compact"
                className="flex-shrink-0 lg:flex-shrink"
              />
            ))}
          </div>
        </section>

        {/* Featured Items */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Featured</h2>
            <Link to="/menu?featured=true" className="text-sm font-medium text-primary">
              See All
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6 pb-2 lg:overflow-visible lg:px-0 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-4">
            {featuredItems.map(item => (
              <FoodCard 
                key={item.id} 
                item={item}
                className="flex-shrink-0 w-44 lg:w-auto"
              />
            ))}
          </div>
        </section>

        {/* Popular Items */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Popular Near You</h2>
            <Link to="/menu" className="text-sm font-medium text-primary">
              See All
            </Link>
          </div>
          <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
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
