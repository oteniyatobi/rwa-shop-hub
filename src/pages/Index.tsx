import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/products/ProductCard';
import { CategoryCard } from '@/components/products/CategoryCard';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { Search, ArrowRight, Shield, Users, Truck, Sparkles, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

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
      <section className="relative overflow-hidden section-padding">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-4">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                Rwanda's #1 Marketplace
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-balance"
            >
              Buy & Sell in{' '}
              <span className="gradient-text">Rwanda</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-5 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto text-balance"
            >
              Find great deals on electronics, fashion, vehicles, and more. 
              Connect directly with trusted local sellers.
            </motion.p>

            {/* Search Bar */}
            <motion.form variants={fadeUp} custom={3} onSubmit={handleSearch} className="mt-10">
              <div className="relative mx-auto max-w-xl">
                <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-border bg-card pl-13 pr-36 text-base shadow-lg shadow-primary/5 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 placeholder:text-muted-foreground/60"
                  style={{ paddingLeft: '3.25rem' }}
                />
                <Button
                  type="submit"
                  size="lg"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-6 h-10 glow-primary"
                >
                  Search
                </Button>
              </div>
            </motion.form>

            {/* Quick Links */}
            <motion.div variants={fadeUp} custom={4} className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">Popular:</span>
              {['iPhone', 'Toyota', 'Laptop', 'House'].map((term) => (
                <Link
                  key={term}
                  to={`/products?search=${term}`}
                  className="rounded-full border border-border/80 bg-card px-4 py-1.5 text-sm font-medium transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                >
                  {term}
                </Link>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section-padding bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold md:text-3xl">Browse Categories</h2>
                <p className="text-muted-foreground mt-1 text-sm">Find exactly what you need</p>
              </div>
              <Button asChild variant="ghost" className="group">
                <Link to="/products">
                  View All <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>
            <motion.div variants={stagger} className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
              {PRODUCT_CATEGORIES.slice(0, 12).map((category, i) => (
                <motion.div key={category.value} variants={fadeUp} custom={i}>
                  <CategoryCard
                    value={category.value}
                    label={category.label}
                    icon={category.icon}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Recent Products Section */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-bold md:text-3xl">Recently Added</h2>
                </div>
                <p className="text-muted-foreground text-sm">Fresh listings from our community</p>
              </div>
              <Button asChild variant="ghost" className="group">
                <Link to="/products">
                  See All <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </motion.div>

            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-shimmer rounded-xl">
                    <div className="aspect-square rounded-xl bg-muted" />
                    <div className="mt-3 h-4 rounded-lg bg-muted w-2/3" />
                    <div className="mt-2 h-3 rounded-lg bg-muted w-1/2" />
                  </div>
                ))}
              </div>
            ) : recentProducts && recentProducts.length > 0 ? (
              <motion.div variants={stagger} className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {recentProducts.map((product, i) => (
                  <motion.div key={product.id} variants={fadeUp} custom={i}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="py-16 text-center">
                <p className="text-muted-foreground">No products yet. Be the first to sell!</p>
                <Button asChild className="mt-4 glow-primary">
                  <Link to="/register?role=vendor">Start Selling</Link>
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="text-center mb-14">
              <h2 className="text-2xl font-bold md:text-3xl">Why Choose Doorstep?</h2>
              <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
                A safer, easier, and more connected way to buy and sell locally.
              </p>
            </motion.div>
            <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
              {[
                {
                  icon: Shield,
                  title: 'Safe & Secure',
                  desc: 'Verified sellers and safe buying tips to protect your transactions.',
                  color: 'primary',
                },
                {
                  icon: Users,
                  title: 'Local Community',
                  desc: 'Connect with buyers and sellers in your area across Rwanda.',
                  color: 'accent',
                },
                {
                  icon: Truck,
                  title: 'Easy Delivery',
                  desc: 'Sellers arrange delivery with local bike riders for your convenience.',
                  color: 'primary',
                },
              ].map((feature, i) => (
                <motion.div
                  key={feature.title}
                  variants={fadeUp}
                  custom={i}
                  className="group relative rounded-2xl border border-border/50 bg-card p-8 text-center transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
                >
                  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary to-primary/80" />
        <div className="absolute inset-0 -z-10 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent/30 blur-3xl" />
        </div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="container mx-auto px-4 text-center"
        >
          <motion.h2 variants={fadeUp} className="text-3xl font-bold text-primary-foreground md:text-4xl text-balance">
            Ready to Start Selling?
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="mt-4 text-primary-foreground/80 text-lg max-w-lg mx-auto">
            Join thousands of vendors on Doorstep and reach customers across Rwanda.
          </motion.p>
          <motion.div variants={fadeUp} custom={2}>
            <Button asChild size="lg" variant="secondary" className="mt-8 rounded-xl px-8 text-base font-semibold shadow-lg">
              <Link to="/register?role=vendor">Become a Vendor</Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>
    </Layout>
  );
}
