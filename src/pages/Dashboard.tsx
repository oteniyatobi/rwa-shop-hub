import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Eye, EyeOff, Package, Loader2, TrendingUp, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useEffect } from 'react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }),
};

export default function Dashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
    if (!authLoading && profile && profile.role !== 'vendor') { toast.error('Only vendors can access the dashboard'); navigate('/'); }
  }, [user, profile, authLoading, navigate]);

  const { data: products, isLoading } = useQuery({
    queryKey: ['my-products', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase.from('products').select('*').eq('vendor_id', profile.id).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('products').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['my-products'] }); toast.success('Product updated'); },
    onError: () => toast.error('Failed to update product'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['my-products'] }); toast.success('Product deleted'); },
    onError: () => toast.error('Failed to delete product'),
  });

  const formatPrice = (price: number) => new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(price);

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading your listings...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const activeCount = products?.filter(p => p.is_active).length || 0;
  const hiddenCount = products?.filter(p => !p.is_active).length || 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
          {/* Header */}
          <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Listings</h1>
              <p className="text-muted-foreground mt-1">Manage your products and track performance</p>
            </div>
            <Button asChild className="rounded-xl glow-primary">
              <Link to="/dashboard/add-product"><Plus className="mr-2 h-4 w-4" /> Add Product</Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total Listings', value: products?.length || 0, icon: Package, color: 'primary' },
              { label: 'Active', value: activeCount, icon: TrendingUp, color: 'primary' },
              { label: 'Hidden', value: hiddenCount, icon: BarChart3, color: 'muted-foreground' },
            ].map((stat) => (
              <div key={stat.label} className="glass-card rounded-2xl p-4 text-center">
                <stat.icon className={`h-5 w-5 mx-auto mb-2 text-${stat.color}`} />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Product Grid */}
          {products && products.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product, i) => (
                <motion.div key={product.id} variants={fadeUp} custom={i}>
                  <Card className="overflow-hidden rounded-2xl border-border/50 card-hover">
                    <div className="relative aspect-video bg-muted overflow-hidden">
                      <img src={product.images?.[0] || '/placeholder.svg'} alt={product.title} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                      {!product.is_active && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                          <Badge variant="secondary" className="rounded-lg">Hidden</Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-primary text-lg">{formatPrice(product.price)}</p>
                          <h3 className="font-medium truncate mt-0.5">{product.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{product.location}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 rounded-xl" asChild>
                          <Link to={`/dashboard/edit-product/${product.id}`}><Edit className="mr-1.5 h-3.5 w-3.5" /> Edit</Link>
                        </Button>
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl" onClick={() => toggleActiveMutation.mutate({ id: product.id, is_active: !product.is_active })}>
                          {product.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone. The product will be permanently deleted.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMutation.mutate(product.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div variants={fadeUp} className="py-20 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
                <Package className="h-9 w-9 text-muted-foreground" />
              </div>
              <h3 className="mt-5 font-bold text-lg">No products yet</h3>
              <p className="mt-2 text-muted-foreground">Add your first product to start selling.</p>
              <Button asChild className="mt-6 rounded-xl glow-primary">
                <Link to="/dashboard/add-product"><Plus className="mr-2 h-4 w-4" /> Add Product</Link>
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
