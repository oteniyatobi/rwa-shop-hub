import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { CategoryCard } from '@/components/products/CategoryCard';
import { PRODUCT_CATEGORIES, RWANDA_LOCATIONS } from '@/lib/constants';
import { Search, ArrowRight, Shield, Users, Truck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

export default function Index() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: recentProducts, isLoading } = useQuery({
    queryKey: ['recent-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(8);
      
      if (error) throw error;
      return data;
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Buy & Sell in <span className="text-primary">Rwanda</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              Find great deals on electronics, fashion, vehicles, and more. Connect directly with local sellers.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mt-8">
              <div className="relative mx-auto max-w-xl">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 w-full rounded-full border-2 bg-background pl-12 pr-32 text-base outline-none transition-colors focus:border-primary"
                />
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-6"
                >
                  Search
                </Button>
              </div>
            </form>

            {/* Quick Links */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">Popular:</span>
              {['iPhone', 'Toyota', 'Laptop', 'House'].map((term) => (
                <Link
                  key={term}
                  to={`/products?search=${term}`}
                  className="rounded-full border bg-background px-3 py-1 text-sm transition-colors hover:border-primary"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Browse Categories</h2>
            <Button asChild variant="ghost">
              <Link to="/products">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6">
            {PRODUCT_CATEGORIES.slice(0, 12).map((category) => (
              <CategoryCard
                key={category.value}
                value={category.value}
                label={category.label}
                icon={category.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Recent Products Section */}
      <section className="bg-muted/50 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recently Added</h2>
            <Button asChild variant="ghost">
              <Link to="/products">
                See All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square rounded-lg bg-muted"></div>
                  <div className="mt-2 h-4 rounded bg-muted"></div>
                  <div className="mt-1 h-3 w-2/3 rounded bg-muted"></div>
                </div>
              ))}
            </div>
          ) : recentProducts && recentProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {recentProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No products yet. Be the first to sell!</p>
              <Button asChild className="mt-4">
                <Link to="/register?role=vendor">Start Selling</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">Why Choose Doorstep?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold text-lg">Safe & Secure</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Verified sellers and safe buying tips to protect your transactions.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-secondary/20">
                <Users className="h-7 w-7 text-secondary-foreground" />
              </div>
              <h3 className="mt-4 font-semibold text-lg">Local Community</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Connect with buyers and sellers in your area across Rwanda.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/20">
                <Truck className="h-7 w-7 text-accent-foreground" />
              </div>
              <h3 className="mt-4 font-semibold text-lg">Easy Delivery</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Sellers arrange delivery with local bike riders for your convenience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-primary-foreground md:text-3xl">
            Ready to Start Selling?
          </h2>
          <p className="mt-3 text-primary-foreground/80">
            Join thousands of vendors on Doorstep and reach customers across Rwanda.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-6">
            <Link to="/register?role=vendor">Become a Vendor</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
}
