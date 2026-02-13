import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }),
};

export default function Favorites() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (!authLoading && !user) navigate('/login'); }, [user, authLoading, navigate]);

  const { data: favorites, isLoading, refetch } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('favorites').select(`id, product:products(*)`).eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      return data.filter(f => f.product !== null);
    },
    enabled: !!user,
  });

  if (authLoading || isLoading) {
    return <Layout><div className="flex min-h-[50vh] items-center justify-center"><div className="flex flex-col items-center gap-3"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="text-sm text-muted-foreground">Loading favorites...</p></div></div></Layout>;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }}>
          <motion.div variants={fadeUp}>
            <h1 className="text-3xl font-bold tracking-tight mb-2">My Favorites</h1>
            <p className="text-muted-foreground mb-8">{favorites?.length || 0} saved items</p>
          </motion.div>

          {favorites && favorites.length > 0 ? (
            <motion.div variants={{ visible: { transition: { staggerChildren: 0.04 } } }} className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {favorites.map((fav, i) => (
                <motion.div key={fav.id} variants={fadeUp} custom={i}>
                  <ProductCard product={fav.product as any} isFavorite={true} onFavoriteToggle={() => refetch()} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div variants={fadeUp} className="py-20 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/5">
                <Heart className="h-9 w-9 text-destructive/40" />
              </div>
              <h3 className="mt-5 font-bold text-lg">No favorites yet</h3>
              <p className="mt-2 text-muted-foreground">Save products you like by clicking the heart icon.</p>
              <Button asChild className="mt-6 rounded-xl glow-primary">
                <Link to="/products">Browse Products</Link>
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
