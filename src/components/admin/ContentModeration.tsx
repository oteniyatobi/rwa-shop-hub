import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Ban, Eye, Loader2, Search, Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';

export function ContentModeration() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products', search],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const blockMutation = useMutation({
    mutationFn: async ({ id, block }: { id: string; block: boolean }) => {
      const { error } = await supabase
        .from('products')
        .update({
          is_blocked: block,
          block_reason: block ? blockReason : null,
          blocked_at: block ? new Date().toISOString() : null,
          blocked_by: block ? user?.id : null,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, { block }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(block ? 'Product blocked' : 'Product unblocked');
      setSelectedProduct(null);
      setBlockReason('');
    },
    onError: () => toast.error('Action failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted');
    },
    onError: () => toast.error('Failed to delete'),
  });

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {products?.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No products found</p>
      )}

      <div className="grid gap-3">
        {products?.map((product) => (
          <Card key={product.id} className={product.is_blocked ? 'border-destructive/50' : ''}>
            <CardContent className="flex items-center gap-4 p-4">
              <img
                src={product.images?.[0] || '/placeholder.svg'}
                alt={product.title}
                className="h-16 w-16 rounded-lg object-cover bg-muted"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate">{product.title}</h3>
                  {product.is_blocked && <Badge variant="destructive">Blocked</Badge>}
                  {!product.is_active && <Badge variant="secondary">Hidden</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{product.location} · {product.category}</p>
                {product.block_reason && (
                  <p className="text-xs text-destructive mt-1">Reason: {product.block_reason}</p>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" asChild>
                  <a href={`/products/${product.id}`} target="_blank"><Eye className="h-3 w-3" /></a>
                </Button>
                {product.is_blocked ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => blockMutation.mutate({ id: product.id, block: false })}
                  >
                    <Undo2 className="h-3 w-3 mr-1" /> Unblock
                  </Button>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm" onClick={() => setSelectedProduct(product.id)}>
                        <Ban className="h-3 w-3 mr-1" /> Block
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Block Product</DialogTitle></DialogHeader>
                      <Textarea
                        placeholder="Reason for blocking..."
                        value={blockReason}
                        onChange={(e) => setBlockReason(e.target.value)}
                      />
                      <DialogFooter>
                        <Button
                          variant="destructive"
                          onClick={() => blockMutation.mutate({ id: product.id, block: true })}
                          disabled={!blockReason.trim()}
                        >
                          Confirm Block
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
