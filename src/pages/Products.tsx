import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { PRODUCT_CATEGORIES, RWANDA_LOCATIONS } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Filter, X, Search, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const stagger = { visible: { transition: { staggerChildren: 0.04 } } };

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const search = searchParams.get('search') || '';

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (location) params.set('location', location);
    if (sortBy && sortBy !== 'newest') params.set('sort', sortBy);
    setSearchParams(params, { replace: true });
  }, [category, location, sortBy, search, setSearchParams]);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', { search, category, location, sortBy }],
    queryFn: async () => {
      let query = supabase.from('products').select('*').eq('is_active', true);
      if (search) query = query.ilike('title', `%${search}%`);
      if (category) query = query.eq('category', category as any);
      if (location) query = query.ilike('location', `%${location}%`);
      switch (sortBy) {
        case 'price_low': query = query.order('price', { ascending: true }); break;
        case 'price_high': query = query.order('price', { ascending: false }); break;
        default: query = query.order('created_at', { ascending: false });
      }
      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data;
    },
  });

  const clearFilters = () => { setCategory(''); setLocation(''); setSortBy('newest'); };
  const hasFilters = category || location || sortBy !== 'newest';

  const FilterContent = () => (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-semibold mb-2 block text-foreground">Category</label>
        <Select value={category || 'all'} onValueChange={(v) => setCategory(v === 'all' ? '' : v)}>
          <SelectTrigger className="rounded-xl"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">All Categories</SelectItem>
            {PRODUCT_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>{cat.icon} {cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-semibold mb-2 block text-foreground">Location</label>
        <Select value={location || 'all'} onValueChange={(v) => setLocation(v === 'all' ? '' : v)}>
          <SelectTrigger className="rounded-xl"><SelectValue placeholder="All Locations" /></SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">All Locations</SelectItem>
            {RWANDA_LOCATIONS.map((loc) => (
              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-semibold mb-2 block text-foreground">Sort By</label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price_low">Price: Low to High</SelectItem>
            <SelectItem value="price_high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {hasFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full rounded-xl">
          <X className="mr-2 h-4 w-4" /> Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={stagger} className="flex items-center justify-between mb-8">
          <motion.div variants={fadeUp}>
            <h1 className="text-3xl font-bold tracking-tight">
              {search ? (
                <>Results for <span className="gradient-text">"{search}"</span></>
              ) : category ? (
                PRODUCT_CATEGORIES.find(c => c.value === category)?.label
              ) : (
                'All Products'
              )}
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              {products?.length || 0} products found
            </p>
          </motion.div>

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="sm" className="rounded-xl gap-2">
                <SlidersHorizontal className="h-4 w-4" /> Filters
                {hasFilters && <span className="h-2 w-2 rounded-full bg-primary" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="border-l border-border/50">
              <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
              <div className="mt-6"><FilterContent /></div>
            </SheetContent>
          </Sheet>
        </motion.div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden w-64 shrink-0 md:block">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="sticky top-24 glass-card rounded-2xl p-5"
            >
              <h3 className="font-bold mb-5 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-primary" /> Filters
              </h3>
              <FilterContent />
            </motion.div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="animate-shimmer rounded-2xl">
                    <div className="aspect-square rounded-2xl bg-muted" />
                    <div className="mt-3 h-4 rounded-lg bg-muted w-3/4" />
                    <div className="mt-2 h-3 rounded-lg bg-muted w-1/2" />
                  </div>
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={stagger}
                className="grid grid-cols-2 gap-4 lg:grid-cols-3"
              >
                {products.map((product, i) => (
                  <motion.div key={product.id} variants={fadeUp} custom={i}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-20 text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                  <Search className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="mt-5 font-bold text-lg">No products found</h3>
                <p className="mt-1.5 text-muted-foreground text-sm">Try adjusting your filters or search terms.</p>
                {hasFilters && (
                  <Button variant="outline" onClick={clearFilters} className="mt-5 rounded-xl">Clear Filters</Button>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
